using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Data;
using ClosedXML.Excel;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using System.Globalization;

namespace SMIS.Controllers
{
    public class UploadDownloadController : Controller
    {
        // GET: UploadDownload

        [HttpPost]
        public JsonResult UploadExcel()
        {
            var httpPostedFile = Request.Files;

            //Open the Excel file using ClosedXML.
            using (XLWorkbook workBook = new XLWorkbook(httpPostedFile[0].InputStream))
            {
                //Read the first Sheet from Excel file.
                IXLWorksheet workSheet = workBook.Worksheet(1);

                //Create a new DataTable.
                DataTable dt = new DataTable();

                //Loop through the Worksheet rows.
                bool firstRow = true;
                foreach (IXLRow row in workSheet.Rows())
                {
                    //Use the first row to add columns to DataTable.
                    if (firstRow)
                    {
                        foreach (IXLCell cell in row.Cells())
                        {
                            dt.Columns.Add(cell.Value.ToString());
                        }
                        firstRow = false;
                    }
                    else
                    {
                        //Add rows to DataTable.
                        if (!(row.Cell(1).Value.ToString() == "" && row.Cell(2).Value.ToString() == "" && row.Cell(3).Value.ToString() == "" && row.Cell(4).Value.ToString() == "" && row.Cell(5).Value.ToString() == "" && row.Cell(6).Value.ToString() == ""))
                        {
                            dt.Rows.Add();
                            dt.Rows[dt.Rows.Count - 1][0] = (string)row.Cell(1).Value.ToString() == "" ? "" : Convert.ToDateTime(row.Cell(1).Value).ToString("MM/dd/yyyy");
                            dt.Rows[dt.Rows.Count - 1][1] = row.Cell(2).Value.ToString();
                            dt.Rows[dt.Rows.Count - 1][2] = row.Cell(3).Value.ToString();
                            dt.Rows[dt.Rows.Count - 1][3] = row.Cell(4).Value.ToString();
                            dt.Rows[dt.Rows.Count - 1][4] = row.Cell(5).Value.ToString();
                            dt.Rows[dt.Rows.Count - 1][5] = row.Cell(6).Value.ToString();
                        }
                    }
                }
                string json = JsonConvert.SerializeObject(dt, Formatting.None);
                return Json(new { data = json }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}