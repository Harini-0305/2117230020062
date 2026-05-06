from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Vehicle Maintenance Scheduler API"}

@app.get("/schedule")
def schedule():
    return {
        "selected_tasks": [],
        "total_impact": 0
    }