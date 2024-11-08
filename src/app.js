import express from "express";
import healthCheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import commentRouter from "./routes/comment.route.js"
import videoRouter from "./routes/video.route.js"
import likeRouter from "./routes/like.route.js";
import tweetRouter from "./routes/tweet.route.js";
import subscriptionRouter from "./routes/subscription.route.js"
import playlistRouter from "./routes/playlist.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import cookieParser from "cookie-parser"

export const app = express();

app.use(cookieParser())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/dashboards", dashboardRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/health-check",healthCheckRouter)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter)
