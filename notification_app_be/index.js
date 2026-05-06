const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = 3000;

// Priority weights
const TYPE_WEIGHT = {
    Placement: 3,
    Result: 2,
    Event: 1
};

// Calculate priority score
function calculatePriority(notification) {

    const typeScore =
        TYPE_WEIGHT[notification.Type] || 0;

    const currentTime = new Date();

    const notificationTime =
        new Date(notification.Timestamp);

    const diffMinutes =
        (currentTime - notificationTime) /
        (1000 * 60);

    // Recent notifications get higher score
    const recencyScore =
        Math.max(0, 100 - diffMinutes);

    return (typeScore * 100) + recencyScore;
}

// API Route
app.get("/notifications", async (req, res) => {

    try {

        const response = await axios.get(
            "http://20.244.56.144/evaluation-service/notifications",
            {
                headers: {
                    Authorization:
                        `Bearer ${process.env.TOKEN}`
                }
            }
        );

        const notifications =
            response.data.notifications;

        // Add priority score
        const prioritized =
            notifications.map((notification) => ({

                ...notification,

                PriorityScore:
                    calculatePriority(notification)

            }));

        // Sort descending
        prioritized.sort(
            (a, b) =>
                b.PriorityScore - a.PriorityScore
        );

        // Top 10
        const top10 =
            prioritized.slice(0, 10);

        res.json(top10);

    } catch (error) {

        console.log(
            "Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Failed to fetch notifications"
        });
    }
});

// Start server
app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});