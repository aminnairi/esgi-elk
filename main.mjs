import {promises as fs} from "fs";
import path from "path";
import fetch from "node-fetch";

console.log("Opening data.csv");

fs.readFile(path.resolve("data.csv")).then(data => {
    console.log("Successfully opened data.csv");

    const rows = [];

    const headers = [
        "title",
        "seo_title",
        "url",
        "author",
        "date",
        "category",
        "locales",
        "content"
    ];

    console.log("Processing data.csv");

    data.toString().split("\n").filter(Boolean).forEach(line => {
        const row = {};

        line.split(";").forEach((column, index) => {
            const header = headers[index];
            const trimmedColumn = column.trim();

            if (!trimmedColumn) {
                row[header] = '""';
            }

            row[header] = trimmedColumn;
        });

        rows.push({index: {}});
        rows.push(row);
    });


    const ndjson = rows.reduce((raw, line) => `${raw}${JSON.stringify(line)}\n`, "") + "\n";

    console.log("Successfully processed data.csv");
    console.log("Ingesting processed data");

    fetch("http://elasticsearch:9200/groupe_2/_doc/_bulk", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: ndjson
    }).then(() => {
        console.log("Ingested data successful.");
    }).catch((error) => {
        console.log("Failed to ingest data.");
    });

    console.log("Writing processed data to data.ndjson");

    fs.writeFile(path.resolve("data.ndjson"), ndjson).then(() => {
        console.log("Successfully wrote processed data to data.ndjson");
    }).catch(() => {
        console.log("Failed to write processed data to data.ndjson");
    });
}).catch(() => {
    console.error("Failed to open data.csv.");
});

