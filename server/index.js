import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
        res.json({message:"Hello World!"});
    });
    

app.use(express.json());

app.listen(process.env.PORT||3000, () => {
    console.log("Server is running on port 3000");
});

