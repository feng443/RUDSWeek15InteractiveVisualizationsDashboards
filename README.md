# Belly Button Biodiversity
Rutgers Data Science Bootcamp - Week 15 Interactive Visualization and Dashboard



## Test Before Deployment (Windoows)


```bash

condo create -n belley_env python=36
activate belley_env

set FLASK_APP=app.py
flask run 


```

### Deploy to Heroku

- Create an app on heroku.com called belly-button-chan
- Through command line, run: 
```

heroku login
heroku git:remote -a belly-button-chan
# Add files and commit 
git push heroku master

```

#### Test on Heroku App

https://belly-button-chan.herokuapp.com/

## Files



