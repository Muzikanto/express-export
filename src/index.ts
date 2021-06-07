import { Parser } from "json2csv";
import express from "express";

const xml = require("xml");

declare module "express-serve-static-core" {
  interface Response {
    export: <T>(
      opts: Omit<ExportOpts<T>, "res"> & { format?: ExportFormat }
    ) => express.Response;
    exportJson: <T>(opts: Omit<ExportOpts<T>, "res">) => express.Response;
    exportCsv: <T>(opts: Omit<ExportOpts<T>, "res">) => express.Response;
    exportXml: <T>(opts: Omit<ExportOpts<T>, "res">) => express.Response;
  }
}

export type FormatOpts<T extends {}> = {
  data: T[];
  fields?: string[];
};
export type ExportOpts<T extends {}> = {
  res: express.Response;
  filename?: string;
  download?: boolean;
} & FormatOpts<T>;
export enum ExportFormat {
  json = "json",
  csv = "csv",
  xml = "xml"
}

class ExportService {
  public extractFields<T extends object>(data: T[]) {
    const fields: { [key: string]: boolean } = {};

    for (const item of data) {
      for (const key in item) {
        fields[key] = true;
      }
    }

    return Object.keys(fields);
  }

  public format<T extends object>({
    fields,
    data,
    format
  }: FormatOpts<T> & { format: ExportFormat }) {
    switch (format) {
      case "csv":
        return this.formatCsv({ data, fields });
      case "xml":
        return this.formatXml({ data, fields });
      case "json":
        return this.formatJson({ data, fields });
      default:
        throw new Error("Invalid format");
    }
  }

  public formatJson<T extends object>({
    data,
    fields: rawFields
  }: FormatOpts<T>) {
    const fields = rawFields || this.extractFields(data);

    return {
      data: data.map(el => {
        // @ts-ignore
        const obj: T = {};

        for (const k of fields) {
          // @ts-ignore
          obj[k] = el[k];
        }

        return obj;
      })
    };
  }

  public formatCsv<T extends object>({
    data,
    fields: rawFields
  }: FormatOpts<T>) {
    const fields = rawFields || this.extractFields(data);

    const parser = new Parser({ fields });

    return parser.parse(data);
  }

  public formatXml<T extends object>({
    data,
    fields: rawFields
  }: FormatOpts<T>) {
    const fields = rawFields || this.extractFields(data);

    return xml(
      {
        data: data.map((el: any) => ({
          item: fields.map(k => ({ [k]: el[k] }))
        }))
      },
      true
    );
  }

  public export<T extends object>({
    res,
    data,
    fields,
    format = ExportFormat.json,
    filename,
    download = false
  }: ExportOpts<T> & { format?: ExportFormat }) {
    switch (format) {
      case ExportFormat.csv:
        return this.exportCsv({ res, data, fields, filename, download });
      case ExportFormat.xml:
        return this.exportXml({ res, data, fields, filename, download });
      case ExportFormat.json:
        return this.exportJson({ res, data, fields, filename, download });
      default:
        return res.send(JSON.stringify({ status: 400, message: "Invalid format" }));
    }
  }

  public exportJson<T extends object>({
    data,
    fields,
    res,
    filename,
    download
  }: ExportOpts<T>) {
    res.set("Content-Type", "application/json");
    this.setDownloadHeader(res, `${filename || "unknown"}.json`, download);

    return res.send(this.formatJson({ data, fields }));
  }

  public exportCsv<T extends object>({
    data,
    fields,
    res,
    filename,
    download
  }: ExportOpts<T>) {
    res.set("Content-Type", "application/csv");
    this.setDownloadHeader(res, `${filename || "unknown"}.csv`, download);

    return res.send(this.formatCsv({ data, fields }));
  }

  public exportXml<T extends object>({
    data,
    fields,
    res,
    filename,
    download
  }: ExportOpts<T>) {
    res.set("Content-Type", "text/xml");
    this.setDownloadHeader(res, `${filename || "unknown"}.xml`, download);

    return res.send(this.formatXml({ data, fields }));
  }

  protected setDownloadHeader(
    res: express.Response,
    filename: string,
    download?: boolean
  ) {
    if (filename.endsWith(".csv") && !download) {
      res.set("Content-Type", "text/plain");
      return;
    }

    res.setHeader(
      "Content-disposition",
      `${download ? "attachment; " : ""}filename=` + `${filename}`
    );
  }

  public isValidFormat(format: string): boolean {
    return format in ExportFormat;
  }

  public applyMiddleware(app: express.Express) {
    const instance = this;

    app.use(function(req, res: any, next) {
      res.export = <T extends object>(
        opts: Omit<ExportOpts<T>, "res"> & { format?: ExportFormat }
      ) => instance.export({ ...opts, res });
      res.exportCsv = <T extends object>(opts: Omit<ExportOpts<T>, "res">) =>
        instance.exportCsv({ ...opts, res });
      res.exportJson = <T extends object>(opts: Omit<ExportOpts<T>, "res">) =>
        instance.exportJson({ ...opts, res });
      res.exportXml = <T extends object>(opts: Omit<ExportOpts<T>, "res">) =>
        instance.exportXml({ ...opts, res });

      next();
    });

    return app;
  }
}

const Export = new ExportService();

export default Export;
