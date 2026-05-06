from fastapi import FastAPI
import requests
import os

app = FastAPI()

BASE_URL = "http://20.207.122.201/evaluation-service"

TOKEN = "YOUR_BEARER_TOKEN"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}


@app.get("/")
def home():
    return {"message": "Vehicle Maintenance Scheduler API"}


@app.get("/schedule")
def schedule_tasks():

    try:

        # Fetch depots
        depot_response = requests.get(
            f"{BASE_URL}/depots",
            headers=headers
        )

        depots = depot_response.json()["depots"]

        # Fetch vehicles
        vehicle_response = requests.get(
            f"{BASE_URL}/vehicles",
            headers=headers
        )

        vehicles = vehicle_response.json()["vehicles"]

        result = []

        # Apply Knapsack for each depot
        for depot in depots:

            max_hours = depot["MechanicHours"]

            n = len(vehicles)

            dp = [
                [0 for _ in range(max_hours + 1)]
                for _ in range(n + 1)
            ]

            # Build DP table
            for i in range(1, n + 1):

                duration = vehicles[i - 1]["Duration"]
                impact = vehicles[i - 1]["Impact"]

                for w in range(max_hours + 1):

                    if duration <= w:

                        dp[i][w] = max(
                            impact + dp[i - 1][w - duration],
                            dp[i - 1][w]
                        )

                    else:
                        dp[i][w] = dp[i - 1][w]

            # Backtrack selected tasks
            selected = []

            w = max_hours

            for i in range(n, 0, -1):

                if dp[i][w] != dp[i - 1][w]:

                    selected.append(vehicles[i - 1])

                    w -= vehicles[i - 1]["Duration"]

            result.append({
                "DepotID": depot["ID"],
                "MechanicHours": max_hours,
                "MaximumImpact": dp[n][max_hours],
                "SelectedTasks": selected
            })

        return {
            "success": True,
            "results": result
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }