import express, { Request, Response } from "express"

import cors from "cors"

let app=express();

app.use(cors());

app.use(express.json());

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

app.get("/", (req:Request, res:Response) => {
    res.json({message: "Hello from server!"});
});