import express from "express";
import ExportFile, { ExportFormat } from "../src";

const server = express();

ExportFile.applyMiddleware(server);

const data = [
  { user: "Maxim", age: 22, location: "Moscow" },
  { user: "Valentina", age: 18 }
];
const fields = ["user", "age"];

server.get("/", function(req, res, next) {
  res.export({
    format: req.query.format as ExportFormat,
    filename: "users",
    data,
    fields,
    download: false
  });
});
server.get("/csv", function(req, res, next) {
  res.exportCsv({
    data,
    filename: "users",
    fields,
    download: true
  });
});
server.get("/xml", function(req, res, next) {
  res.exportXml({
    data,
    filename: "users",
    fields,
    download: true
  });
});
server.get("/json", function(req, res, next) {
  res.exportJson({
    data,
    filename: "users",
    fields,
    download: true
  });
});

server.listen(3000, function() {
  console.log("Server listen on http://localhost:3000");
});
