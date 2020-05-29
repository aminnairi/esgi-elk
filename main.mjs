import {promises as fs} from "fs";
import path from "path";
import fetch from "node-fetch";

fs.readFile(path.resolve("data.csv")).then(data => {
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

    fs.writeFile(path.resolve("data.ndjson"), ndjson).then(() => {
        console.log("Wrote data to data.ndjson successfully.");
    }).catch(() => {
        console.log("Failed to write data to data.ndjson.");
    });
}).catch(() => {
    console.error("Failed to open data.csv.");
});

