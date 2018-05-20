"""

<Chan Feng> 2018-05-20 Rutgers Data Science - Interactive Visualizations and Dashboard

TODO:
1) Remove hard coded SQL
2) Figure out better ways to read into dataframe

"""

import pandas as pd
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import (
    Flask,
    render_template,
    jsonify,
)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
# @TODO: Setup your database here
#from flask_sqlalchemy import SQLAlchemy

#app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///DataSets/belly_button_biodiversity.sqlite"
engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
# db = SQLAlchemy(app)

Base = automap_base()
Base.prepare(engine, reflect=True)

Otu = Base.classes.otu
Samples = Base.classes.samples
SampleMetadata = Base.classes.samples_metadata

session = Session(engine)
# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/names')
def names():
    """List of sample names.

    Returns a list of sample names in the format
    [
        "BB_940",
        "BB_941",
        "BB_943",
        "BB_944",
        "BB_945",
        "BB_946",
        "BB_947",
        ...
    ]
    """
    df = pd.read_sql_query('select * from samples limit 1', engine)
    return jsonify(df.columns[1:].tolist())

#print(names())

@app.route('/metadata/<sample>')
def metadata(sample):
    """MetaData for a given sample.

    Args: Sample in the format: `BB_940`

    Returns a json dictionary of sample metadata in the format

    {
        AGE: 24,
        BBTYPE: "I",
        ETHNICITY: "Caucasian",
        GENDER: "F",
        LOCATION: "Beaufort/NC",
        SAMPLEID: 940
    }
    """
    sample = sample.replace('BB_', '')
    columns = ['AGE', 'BBTYPE', 'ETHNICITY', 'GENDER', 'LOCATION', 'SAMPLEID']
    result = session.query(
        SampleMetadata.AGE,
        SampleMetadata.BBTYPE,
        SampleMetadata.ETHNICITY,
        SampleMetadata.GENDER,
        SampleMetadata.LOCATION,
        SampleMetadata.SAMPLEID
    ).filter(SampleMetadata.SAMPLEID == sample).first()
    if result:
        return jsonify({x: result[i] for i, x in enumerate(columns)})
    else:
        return jsonify(None)

#print(metadata('BB_940'))

@app.route('/otu')
def otu():
    """List of OTU descriptions.

    Returns a list of OTU descriptions in the following format

    [
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Bacteria",
        "Bacteria",
        "Bacteria",
        ...
    ]
    """
    return jsonify([x[0] for x in session.query(Otu.lowest_taxonomic_unit_found).all()])

@app.route('/wfreq/<sample>')
def wfreq(sample):
    """Weekly Washing Frequency as a number.

    Args: Sample in the format: `BB_940`

    Returns an integer value for the weekly washing frequency `WFREQ`
    """
    sample = sample.replace('BB_', '')
    result = session.query(SampleMetadata.WFREQ).filter(SampleMetadata.SAMPLEID == sample).first()
    if result:
        return jsonify(result[0])
    else:
        return jsonify(None)

#print(wfreq('BB_940'))

@app.route('/samples/<sample>')
def samples(sample):
    """OTU IDs and Sample Values for a given sample.

    Sort your Pandas DataFrame (OTU ID and Sample Value)
    in Descending Order by Sample Value

    Return a list of dictionaries containing sorted lists  for `otu_ids`
    and `sample_values`

    [
        {
            otu_ids: [
                1166,
                2858,
                481,
                ...
            ],
            sample_values: [
                163,
                126,
                113,
                ...
            ]
        }
    ]
    """
    df = pd.read_sql_table('samples', engine)
    df = df.loc[:, [sample]].query( sample + '> 0')
    df = df.sort_values(sample, ascending=False)
    return jsonify([{
        'otu_ids': df.index.values.tolist(),
        'sample_values': df[sample].tolist()
    }])

if __name__ == "__main__":
    app.run(debug=True,
            extra_files=['templates/index.html,'
                         'static/js/app.js',
                         'static/css/style.css'])
