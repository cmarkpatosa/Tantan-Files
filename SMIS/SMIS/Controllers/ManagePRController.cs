using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using SMIS.Models;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using System.IO;
using System.Net.Mime;
using SMIS.Reports;
using System.Configuration;
using CrystalDecisions.Shared;
using CrystalDecisions.CrystalReports.Engine;
using System.Globalization;
using Newtonsoft.Json.Linq;
using System.Collections;
using Microsoft.Ajax.Utilities;

namespace SMIS.Controllers
{
    public class ManagePRController : Controller
    {

        UnitOfWork _unitOfWork;
        SMISEntities db = new SMISEntities();
        string ServerName = ConfigurationManager.AppSettings["ServerName"];
        string DatabaseName = ConfigurationManager.AppSettings["DatabaseName"];
        string Username = ConfigurationManager.AppSettings["Username"];
        string Password = ConfigurationManager.AppSettings["Password"];


        private IManagePRRepository _managePRRepository;
        public ManagePRController()
        {
            this._managePRRepository = new ManagePRRepository();
            _unitOfWork = new UnitOfWork(new SMISEntities());
        }

        ReportDocument GetReport(ReportDocument rd)
        {
            rd.Refresh();
            TableLogOnInfos crtableLogoninfos = new TableLogOnInfos();
            TableLogOnInfo crtableLogoninfo = new TableLogOnInfo();
            ConnectionInfo crConnectionInfo = new ConnectionInfo();
            Tables CrTables;

            crConnectionInfo.ServerName = ServerName;
            crConnectionInfo.DatabaseName = DatabaseName;
            crConnectionInfo.UserID = Username;
            crConnectionInfo.Password = Password;

            CrTables = rd.Database.Tables;
            foreach (Table crTb in CrTables)
            {
                crtableLogoninfo = crTb.LogOnInfo;
                crtableLogoninfo.ConnectionInfo = crConnectionInfo;
                crTb.ApplyLogOnInfo(crtableLogoninfo);
            }
            rd.SetDatabaseLogon(crConnectionInfo.UserID, crConnectionInfo.Password, crConnectionInfo.ServerName, crConnectionInfo.DatabaseName);
            foreach (ReportDocument rd1 in rd.Subreports)
            {
                Tables crTbs;
                crTbs = rd1.Database.Tables;
                foreach (Table crTb in crTbs)
                {
                    crtableLogoninfo = crTb.LogOnInfo;
                    crtableLogoninfo.ConnectionInfo = crConnectionInfo;
                    crTb.ApplyLogOnInfo(crtableLogoninfo);
                }
            }
            return rd;
        }

        public FileResult GenerateReport(int purchaseRequestID, string reportType, string param = "")
        {
            ReportDocument rd = new ReportDocument();
            switch (reportType)
            {
                case "PR":
                    rd = GetReport(new crPR());
                    rd.SetParameterValue("_PurchaseRequestID", purchaseRequestID);
                    rd.SetParameterValue("@PurchaseRequestID", purchaseRequestID);
                    break;
                case "RIS":
                    rd = GetReport(new crRIS());
                    rd.SetParameterValue("_PurchaseRequestID", purchaseRequestID);
                    rd.SetParameterValue("@PurchaseRequestID", purchaseRequestID);
                    break;
                case "PurchaseOrder":
                    rd = GetReport(new crPO());
                    rd.SetParameterValue("_PurchaseRequestID", purchaseRequestID);
                    rd.SetParameterValue("@PurchaseRequestID", purchaseRequestID);
                    break;
                case "Canvass":
                    rd = GetReport(new crCanvass());
                    rd.SetParameterValue("_PurchaseRequestID", purchaseRequestID);
                    rd.SetParameterValue("@PurchaseRequestID", purchaseRequestID);
                    break;
                case "AbstractOfCanvass":
                    rd = GetReport(new crAbstract());
                    rd.SetParameterValue("@PurchaseRequestID", purchaseRequestID);
                    var obj = param.Split('|');

                    rd.SetParameterValue("Winner", obj[0]);
                    rd.SetParameterValue("TimeOpened", obj[1]);
                    rd.SetParameterValue("ACT", obj[2]);
                    rd.SetParameterValue("ACD", obj[3]);

                    var list = _unitOfWork.CanvassRepository.Entities.Where(a => a.PurchaseRequestID == purchaseRequestID);
                    foreach (Canvass item in list)
                    {
                        item.Winner = false;
                    }
                    string supplier = obj[0];
                    var canvass = list.FirstOrDefault(a => a.Supplier.SupplierName == supplier);
                    canvass.Winner = true;
                    canvass.TimeOpened = obj[1];
                    canvass.ACTNo = obj[2];
                    canvass.ACDNo = obj[3];

                    _unitOfWork.Commit();
                    break;
                case "PRHistory":
                    rd = GetReport(new crPRHistory());
                    rd.SetParameterValue("_PurchaseRequestID", purchaseRequestID);
                    rd.SetParameterValue("@PurchaseRequestID", purchaseRequestID);
                    break;
                default:
                    break;
            }

            Stream stream = rd.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat);
            stream.Seek(0, SeekOrigin.Begin);
            var cd = new ContentDisposition
            {
                FileName = reportType + ".pdf",
                Inline = true
            };

            Response.AppendHeader("Content-Disposition", cd.ToString());
            rd.Dispose();
            return File(stream, MediaTypeNames.Application.Pdf);
        }

        public FileResult GenerateReport2(int purchaseOrderID, string reportType, string taxComputation)
        {
            ReportDocument rd = new ReportDocument();
            switch (reportType)
            {
                case "PO":
                    rd = GetReport(new crPO());
                    rd.SetParameterValue("_PurchaseOrderID", purchaseOrderID);
                    rd.SetParameterValue("@PurchaseOrderID", purchaseOrderID);
                    break;
                case "IAR":
                    rd = GetReport(new crIAR());
                    rd.SetParameterValue("_PurchaseOrderID", purchaseOrderID);
                    rd.SetParameterValue("@PurchaseOrderID", purchaseOrderID);
                    break;
                case "ORS":
                    rd = GetReport(new crORS());
                    rd.SetParameterValue("_PurchaseOrderID", purchaseOrderID);
                    break;
                case "DV":
                    rd = GetReport(new crDV());
                    rd.SetParameterValue("_PurchaseOrderID", purchaseOrderID);
                    rd.SetParameterValue("TaxComputation", taxComputation);

                    break;
                case "DVBIR":
                    rd = GetReport(new crDVBIR());
                    rd.SetParameterValue("_PurchaseOrderID", purchaseOrderID);
                    rd.SetParameterValue("TaxComputation", taxComputation);
                    break;
                default:
                    break;
            }

            Stream stream = rd.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat);
            stream.Seek(0, SeekOrigin.Begin);
            var cd = new ContentDisposition
            {
                FileName = reportType + ".pdf",
                Inline = true
            };

            Response.AppendHeader("Content-Disposition", cd.ToString());
            rd.Dispose();
            return File(stream, MediaTypeNames.Application.Pdf);
        }

        public ActionResult DeletePurchaseOrder(int purchaseOrderID)
        {
            var pod = db.PurchaseOrderDetails.Where(a => a.PurchaseOrderID == purchaseOrderID).ToList();
            foreach (var _pod in pod)
            {
                db.PurchaseOrderDetails.Remove(_pod);
                db.SaveChanges();
            }

            var po = db.PurchaseOrders.SingleOrDefault(a => a.PurchaseOrderID == purchaseOrderID);
            db.PurchaseOrders.Remove(po);
            db.SaveChanges();

            return Json(new
            {
                success = true,
                message = "Purchase Order successfully deleted!"
            }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult CreatePR()
        {
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }

            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
            var office = Convert.ToInt32(Session["OfficeID"]);
            switch (office)
            {
                case 1:

                    break;
                case 2:

                    break;
                case 3:

                    break;
            }
            var DivisionID = _unitOfWork.OfficeRepository.Entities.FirstOrDefault(a => a.OfficeID == office).DivisionID;
            ViewBag.TransactionTypes = new SelectList(db.TransactionTypes.ToList().OrderBy(a => a.TransactionType1), "TransactionTypeID", "TransactionType1");
            ViewBag.Status = new SelectList(db.Status.Where(a => a.Step != null).ToList(), "StatusID", "Status1");
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.PreparedBy = new SelectList(_unitOfWork.UserAccountRepository.Entities.ToList().Where(a => a.DivisionID == DivisionID), "UserID", "AccountName");


            return View();
        }

        public ActionResult CreateCanvass()
        {
            ViewBag.PRList = new SelectList(db.PurchaseRequests.Where(a => a.StatusID == 5 && a.Amount >= 50000).ToList(), "PurchaseRequestID", "PRNumber");
            ViewBag.TransactionTypes = new SelectList(db.TransactionTypes.ToList().OrderBy(a => a.TransactionType1), "TransactionTypeID", "TransactionType1");
            ViewBag.Suppliers = new SelectList(db.Suppliers.ToList(), "SupplierID", "SupplierName");

            return View();
        }

        public ActionResult SaveCanvass(Canvass canvass)
        {
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            canvass.UserID = userID;
            canvass.Winner = false;
            _unitOfWork.CanvassRepository.Add(canvass);
            string msg = "";
            try
            {
                _unitOfWork.Commit();
                msg = "Record successfully saved...";
            }
            catch (Exception ex)
            {
                msg = ex.ToString() + " | Please Contact Administrator";
            }

            return Json(new { success = true, message = msg }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult DeleteCanvass(int canvassID) {
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            var list = _managePRRepository.GetCanvassDetailList(canvassID);
            foreach (var item in list)
            {
                _unitOfWork.CanvassDetailRepository.Remove(item);
            }
            _unitOfWork.CanvassRepository.Remove(_managePRRepository.GetCanvass(canvassID));
            string msg = "";
            try
            {
                _unitOfWork.Commit();
                msg = "Record successfully deleted...";
            }
            catch (Exception ex)
            {
                msg = ex.ToString() + " | Please Contact Administrator";
            }
            return Json(new { success = true, message = msg }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCanvass()
        {
            List<object> objList = new List<object>();
            var result = _managePRRepository.GetCanvassList().DistinctBy(a => a.PurchaseRequestID);
            string role = Convert.ToString(Session["Role"]);
            int officeID = Convert.ToInt32(Session["OfficeID"]);
            foreach (var item in result)
            {
                var obj = new
                {
                    item.PurchaseRequestID,
                    Prepared = item.PurchaseRequest.Division.DivisionName,
                    item.PurchaseRequest.PRNumber,
                    item.PurchaseRequest.Purpose,
                    item.PurchaseRequest.Amount,
                    //Total = item.CanvassDetails.Sum(a => a.UnitPrice).Value
                };

                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCanvassSupplier(int purchaseRequestID) {
            List<object> objList = new List<object>();

            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCanvassList(int purchaseRequestID) {
            List<object> objList = new List<object>();
            var result = _managePRRepository.GetCanvassList().Where(a => a.PurchaseRequestID == purchaseRequestID).OrderBy(a => a.DateCanvass);
            string role = Convert.ToString(Session["Role"]);
            int officeID = Convert.ToInt32(Session["OfficeID"]);
            foreach (var item in result)
            {
                var obj = new
                {
                    item.CanvassID,
                    item.Supplier.SupplierName,
                    item.Canvasser,
                    DateCanvass = item.DateCanvass.Value.ToShortDateString(),
                    Total = item.CanvassDetails.Sum(a => a.UnitPrice).Value
                };

                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetCanvassItems(int canvassID) {
            List<object> objList = new List<object>();
            var result = _managePRRepository.GetCanvassList().Where(a => a.CanvassID == canvassID).OrderBy(a => a.DateCanvass);
            string role = Convert.ToString(Session["Role"]);
            int officeID = Convert.ToInt32(Session["OfficeID"]);
            foreach (var item in result.FirstOrDefault().CanvassDetails)
            {
                var obj = new
                {
                    item.CanvassDetailID,
                    ActivityDate = item.PurchaseRequestDetail.ActivityDate == null ? "" : item.PurchaseRequestDetail.ActivityDate.Value.ToString("MM/dd/yyyy"),
                    item.PurchaseRequestDetail.ItemName,
                    item.PurchaseRequestDetail.Specification,
                    item.PurchaseRequestDetail.Unit,
                    item.PurchaseRequestDetail.Quantity,
                    item.UnitPrice,
                    Total = item.UnitPrice * item.PurchaseRequestDetail.Quantity,
                };

                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult UpdatePR(int PurchaseRequestID, int PreparedBy)
        {
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }

            var pr = _unitOfWork.PurchaseRequestRepository.Entities.Where(a => a.PurchaseRequestID == PurchaseRequestID).FirstOrDefault();
            pr.PreparedBy = PreparedBy;
            _unitOfWork.Commit();

            return Json(new { result = "Success" }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult PRList()
        {
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");

            return View();
        }

        // GET: ManagePR
        [HttpPost]
        public ActionResult SavePurchaseRequest(PurchaseRequest purchaseRequest)
        {
            purchaseRequest.DivisionID = Convert.ToInt32(Session["DivisionID"]);
            purchaseRequest.UserID = Convert.ToInt32(Session["UserID"]);

            if (purchaseRequest.UserID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            if (purchaseRequest.PurchaseRequestID == 0) purchaseRequest.StatusID = 15;

            try
            {
                var n = _unitOfWork.PurchaseRequestRepository.Entities.Count();
                var seq = n + 1;

                n = (n + 1).ToString().Length;
                string result = "";
                switch (n)
                {
                    case 1:
                        result = "000" + seq.ToString();
                        break;
                    case 2:
                        result = "00" + seq.ToString();
                        break;
                    case 3:
                        result = "0" + seq.ToString();
                        break;
                    case 4:
                        result = seq.ToString();
                        break;
                }
                int purchaseRequestID = purchaseRequest.PurchaseRequestID;
                if (purchaseRequestID == 0)
                {
                    purchaseRequest.DatePrepared = DateTime.Now;
                    purchaseRequest.ControlNumber = DateTime.Now.Year + "-" + result + "-" + _unitOfWork.DivisionRepository.Entities.SingleOrDefault(a => a.DivisionID == purchaseRequest.DivisionID).DivisionName;
                    purchaseRequest.Amount = purchaseRequest.PurchaseRequestDetails.Sum(a => a.UnitCost * a.Quantity);
                    _unitOfWork.PurchaseRequestRepository.Add(purchaseRequest);

                    Log logs = new Log();
                    logs.PurchaseRequestID = Convert.ToInt32(purchaseRequest.PurchaseRequestID);
                    logs.StatusID = Convert.ToInt32(purchaseRequest.StatusID);
                    logs.TransactionDate = DateTime.Now;
                    logs.UserID = Convert.ToInt32(purchaseRequest.UserID);
                    logs.Remarks = "Prepared PR " + purchaseRequest.ControlNumber;
                    _unitOfWork.LogRepository.Add(logs);
                }
                else
                {
                    var pr = new PurchaseRequest();
                    pr = _unitOfWork.PurchaseRequestRepository.Entities.SingleOrDefault(a => a.PurchaseRequestID == purchaseRequestID);
                    pr.TransactionTypeID = purchaseRequest.TransactionTypeID;
                    pr.Purpose = purchaseRequest.Purpose;
                    pr.Amount = purchaseRequest.Amount;
                    _unitOfWork.PurchaseRequestRepository.Update(pr);

                    foreach (var item in purchaseRequest.PurchaseRequestDetails)
                    {
                        var o = new PurchaseRequestDetail();
                        int purchaseRequestDetailID = item.PurchaseRequestDetailID;
                        if (item.ActivityDate != null)
                        {
                            item.ActivityDate = Convert.ToDateTime(item.ActivityDate);
                        }

                        if (item.PurchaseRequestID == -1)
                        {
                            _unitOfWork.PurchaseRequestDetailRepository.Remove(_unitOfWork.PurchaseRequestDetailRepository.Entities.SingleOrDefault(a => a.PurchaseRequestDetailID == purchaseRequestDetailID));
                        }
                        else if (purchaseRequestDetailID != 0)
                        {
                            var obj = pr.PurchaseRequestDetails.SingleOrDefault(a => a.PurchaseRequestDetailID == purchaseRequestDetailID);
                            obj.ActivityDate = item.ActivityDate;
                            obj.ItemName = item.ItemName;
                            obj.Specification = item.Specification;
                            obj.Unit = item.Unit;
                            obj.Quantity = item.Quantity;
                            obj.UnitCost = item.UnitCost;
                            _unitOfWork.PurchaseRequestDetailRepository.Update(obj);
                        }
                        else
                        {
                            o.PurchaseRequestID = item.PurchaseRequestID;
                            o.ActivityDate = item.ActivityDate;
                            o.ItemName = item.ItemName;
                            o.Specification = item.Specification;
                            o.Unit = item.Unit;
                            o.Quantity = item.Quantity;
                            o.UnitCost = item.UnitCost;
                            _unitOfWork.PurchaseRequestDetailRepository.Add(o);
                        }
                    }
                }
                _unitOfWork.Commit();

                return Json(new { success = true, message = "PR " + purchaseRequest.ControlNumber + " with amount of ₱ " + Convert.ToDecimal(purchaseRequest.Amount).ToString("N2") + " successfully saved" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                _unitOfWork.RejectChanges();
                return Json(new { success = false, message = ex.Message + ", " + ex.InnerException }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SavePurchaseOrder(PurchaseOrder purchaseOrder)
        {
            purchaseOrder.UserID = Convert.ToInt32(Session["UserID"]);
            if (purchaseOrder.UserID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }

            try
            {
                _unitOfWork.PurchaseOrderRepository.Add(purchaseOrder);
                _unitOfWork.Commit();
                return Json(new { success = true, message = "PO with PO Number " + _unitOfWork.PurchaseRequestRepository.Entities.FirstOrDefault(a => a.PurchaseRequestID == purchaseOrder.PurchaseRequestID).PRNumber + " successfully saved..." }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                _unitOfWork.RejectChanges();
                return Json(new { success = false, message = ex.Message + ", " + ex.InnerException }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult UpdateItemSpecification(int purchaseRequestDetailID, string specification)
        {
            var obj = db.PurchaseRequestDetails.SingleOrDefault(a => a.PurchaseRequestDetailID == purchaseRequestDetailID);
            obj.Specification = specification;
            db.SaveChanges();
            return Json(new { success = false, message = "Item Specification successfully updated..." }, JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetOffices()
        {
            var obj = db.Offices.ToList().Select(a => new
            {
                id = a.OfficeID,
                value = a.OfficeName
            });
            return Json(obj);
        }

        public JsonResult GetStatus()
        {
            var obj = db.Status.ToList().Select(a => new
            {
                id = a.StatusID,
                value = a.Status1
            });
            return Json(obj);
        }

        [HttpGet]
        public JsonResult GetNextProcess(int purchaseRequestID)
        {
            var o = _managePRRepository.GetPR(purchaseRequestID);
            int step = Convert.ToInt32(db.Status.SingleOrDefault(a => a.StatusID == o.StatusID).Step);
            if (o.StatusID == 9)
            {
                step = Convert.ToInt32(db.Logs.OrderByDescending(a => a.LogID).FirstOrDefault(a => a.StatusID != 14 && a.StatusID != 9 && a.PurchaseRequestID == purchaseRequestID).Status.Step);
                if (Convert.ToBoolean(o.ForRevision)) step = 1;
            }
            else if (step == 0)
            {
                var l = db.Logs.OrderByDescending(a => a.TransactionDate).SingleOrDefault(a => a.StatusID != 9 && a.OfficeID != null && a.PurchaseRequestID == purchaseRequestID);
                step = l == null ? 0 : Convert.ToInt32(l.StatusID);
                if (step == 0)
                {
                    step = 1;
                }
            }
            else
            {
                step = Convert.ToInt32(db.Status.SingleOrDefault(a => a.StatusID == o.StatusID).Step) + 1;
            }

            var obj = db.Status.FirstOrDefault(a => a.Step == step);
            if (o.Amount > 50000 && o.StatusID == 13)
            {
                obj = db.Status.FirstOrDefault(a => a.StatusID == 30);
            }
            else if (o.StatusID == 30)
            {
                obj = db.Status.FirstOrDefault(a => a.StatusID == 31);
            }
            return Json(new { pr = o, statusID = obj.StatusID, officeID = obj.OfficeID }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetPreviousProcess(int purchaseRequestID)
        {
            var o = _managePRRepository.GetPR(purchaseRequestID);
            var curStep = db.Status.SingleOrDefault(a => a.StatusID == o.StatusID).Step;

            var obj = db.Status.Select(a => new
            {
                Step = a.Step,
                OfficeID = a.OfficeID,
                OfficeName = a.Office.OfficeName,
                StatusID = a.StatusID,
                Status = a.Status1
            }).SingleOrDefault(a => a.Step == (curStep - 1));
            return Json(new { pr = o, o = obj }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetLogs(int PurchaseRequestID)
        {
            //var obj = _managePRRepository.GetPRLogs(PurchaseRequestID);
            var obj = _managePRRepository.GetLogsByID(PurchaseRequestID);
            return PartialView(obj);
        }

        public JsonResult LoadCombobox(int officeID)
        {
            var list = db.Status.Where(a => a.OfficeID == officeID).ToList().Select(s => new { id = s.StatusID, name = s.Status1 });
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetPurchaseRequest(int purchaseRequestID, string type = "")
        {
            var PRs = new object();

            PRs = _unitOfWork.PurchaseRequestRepository.Entities.
                Where(a => a.PurchaseRequestID == purchaseRequestID).Select(a => new
                {
                    a.PurchaseRequestID,
                    a.ControlNumber,
                    a.PRNumber,
                    a.DatePRAssigned,
                    a.DatePrepared,
                    a.DivisionID,
                    a.Purpose,
                    a.TransactionTypeID,
                    a.Amount,
                    a.StatusID,
                    a.Remarks,
                    a.IsReceived,
                    a.IsCancelled,
                    a.ForRevision,
                    a.UserID,
                    SupplierID = 0,
                    PurchaseRequestDetail = a.PurchaseRequestDetails.Select(b => new
                    {
                        b.PurchaseRequestDetailID,
                        b.ActivityDate,
                        //ActivityDate = b.ActivityDate == null ? "" : b.ActivityDate.Value.ToString("MM/dd/yyyy"),
                        b.ItemName,
                        b.Specification,
                        b.Unit,
                        b.Quantity,
                        b.UnitCost,
                        TotalCost = b.UnitCost * b.Quantity
                    }).ToList()
                });
            // DISABLED NEED TO FINISH THE ABSTRACT OF CANVASS MODULE
            //var pr = _unitOfWork.PurchaseRequestRepository.Entities.FirstOrDefault(a => a.PurchaseRequestID == purchaseRequestID);
            //if (type == "PO" && pr.Amount >= 50000)
            //{
            //    PRs = _unitOfWork.CanvassDetailRepository.Entities.
            //        Where(a => a.Canvass.PurchaseRequestID == purchaseRequestID && a.Canvass.Winner == true).Select(a => new
            //        {
            //            a.Canvass.PurchaseRequest.PurchaseRequestID,
            //            a.Canvass.PurchaseRequest.ControlNumber,
            //            a.Canvass.PurchaseRequest.PRNumber,
            //            a.Canvass.PurchaseRequest.DatePRAssigned,
            //            a.Canvass.PurchaseRequest.DatePrepared,
            //            a.Canvass.PurchaseRequest.DivisionID,
            //            a.Canvass.PurchaseRequest.Purpose,
            //            a.Canvass.PurchaseRequest.TransactionTypeID,
            //            a.Canvass.PurchaseRequest.Amount,
            //            a.Canvass.PurchaseRequest.StatusID,
            //            a.Canvass.PurchaseRequest.Remarks,
            //            a.Canvass.PurchaseRequest.IsReceived,
            //            a.Canvass.PurchaseRequest.IsCancelled,
            //            a.Canvass.PurchaseRequest.ForRevision,
            //            a.Canvass.PurchaseRequest.UserID,
            //            a.Canvass.SupplierID,
            //            PurchaseRequestDetail = a.Canvass.PurchaseRequest.PurchaseRequestDetails.Select(b => new
            //            {
            //                b.PurchaseRequestDetailID,
            //                b.ActivityDate,
            //                //ActivityDate = b.ActivityDate == null ? "" : b.ActivityDate.Value.ToString("MM/dd/yyyy"),
            //                b.ItemName,
            //                b.Specification,
            //                b.Unit,
            //                b.Quantity,
            //                UnitCost = a.UnitPrice,
            //                TotalCost = a.UnitPrice * b.Quantity
            //            }).ToList(),
            //            a.Canvass.Winner
            //        });
            //}

            JavaScriptSerializer js = new JavaScriptSerializer();
            return Json(new
            {
                PurchaseRequest = js.Serialize(PRs)
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetPurchaseOrders(int purchaseRequestID)
        {
            var purchaseOrders = _managePRRepository.GetPOs().Where(a => a.PurchaseRequestID == purchaseRequestID);
            return Json(new
            {
                data = purchaseOrders.Select(a => new
                {
                    a.PurchaseRequestID,
                    a.PurchaseOrderID,
                    a.Supplier.SupplierName,
                    a.PurchaseRequest.PRNumber,
                    a.PurchaseRequest.Purpose,
                    Amount = Convert.ToDecimal(a.Amount).ToString("N2")
                }).ToList()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult SubmitPR(Log log, string PRNumber, string PRDate, bool ForRevision)
        {
            try
            {
                string msg = "";
                int userID = Convert.ToInt32(Session["UserID"]);
                if (userID == 0)
                {
                    ViewBag.Message = "Login Session Expired, kindly login again...";
                    return RedirectToAction("Login", "User");
                }
                log.UserID = userID;
                switch (log.StatusID)
                {
                    case 10:
                    case 14:
                    case 15:
                        log.OfficeID = null;
                        break;
                    case 9:
                        log.OfficeID = null;
                        _managePRRepository.ForRevision(Convert.ToInt32(log.PurchaseRequestID), ForRevision);
                        break;
                    default:
                        break;
                }
                msg = _managePRRepository.SubmitPR(log);
                if (log.StatusID == 4 || PRNumber != "")
                {
                    _managePRRepository.SetPRNumber(Convert.ToInt32(log.PurchaseRequestID), PRNumber, PRDate);
                }

                return Json(new
                {
                    success = true,
                    message = msg
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message + ", " + ex.InnerException
                });
            }
        }


        public ActionResult OnProcess()
        {
            ViewBag.TransactionTypes = new SelectList(db.TransactionTypes.ToList(), "TransactionTypeID", "TransactionType1");
            ViewBag.Status = new SelectList(db.Status.ToList(), "StatusID", "Status1");
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");

            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            return View();
        }

        public ActionResult CreatePO()
        {
            ViewBag.TransactionTypes = new SelectList(db.TransactionTypes.ToList(), "TransactionTypeID", "TransactionType1");
            ViewBag.Status = new SelectList(db.Status.ToList(), "StatusID", "Status1");
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.Suppliers = new SelectList(db.Suppliers.ToList(), "SupplierID", "SupplierName");
            ViewBag.PRList = new SelectList(db.PurchaseRequests.Where(a => a.StatusID == 6).ToList(), "PurchaseRequestID", "PRNumber");
            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
            var userID = Convert.ToInt32(Session["UserID"]);
            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            return View();
        }

        public JsonResult GetPRs()
        {
            List<object> objList = new List<object>();
            var result = _managePRRepository.GetPRs().OrderByDescending(a => a.Logs.LastOrDefault().TransactionDate).Where(a => a.StatusID != 10).Select(a => new { o = a, TransactionDate = _managePRRepository.GetLogsByID(a.PurchaseRequestID).Last().TransactionDate });

            string role = Convert.ToString(Session["Role"]);
            if (role != "Administrator")
            {
                int divisionID = Convert.ToInt32(Session["DivisionID"]);
                result = _managePRRepository.GetPRs().Where(a => a.DivisionID == divisionID).Select(a => new { o = a, TransactionDate = _managePRRepository.GetLogsByID(a.PurchaseRequestID).Last().TransactionDate });
            }

            //result = result.OrderByDescending(a => a.PurchaseRequestID);
            foreach (var item in result)
            {
                var datePrepared = item.o.DatePrepared;
                var datePRAssigned = item.o.DatePRAssigned;
                var obj = new
                {
                    PurchaseRequestID = item.o.PurchaseRequestID,
                    item.o.UserID,
                    item.o.IsReceived,
                    ControlNumber = item.o.ControlNumber,
                    PRNumber = item.o.PRNumber,
                    DatePrepared = datePrepared == null ? "" : datePrepared.Value.ToShortDateString() + " " + datePrepared.Value.ToShortTimeString(),
                    DatePRPrepared = datePRAssigned == null ? "" : datePRAssigned.Value.ToShortDateString(),
                    DivisionName = item.o.Division.DivisionName,
                    Purpose = item.o.Purpose,
                    TransactionTypeID = item.o.TransactionTypeID,
                    TransactionType = item.o.TransactionType.TransactionType1,
                    Amount = Convert.ToDecimal(item.o.Amount).ToString("N2"),
                    Supplier = 0,
                    Status = item.o.Status == null ? "Preparing..." : item.o.Status.Status1,
                    Remarks = item.o.Remarks,
                    item.o.ForRevision,
                    item.TransactionDate,
                };
                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Cancelled()
        {
            var userID = Convert.ToInt32(Session["UserID"]);

            if (userID == 0)
            {
                ViewBag.Message = "Login Session Expired, kindly login again...";
                return RedirectToAction("Login", "User");
            }
            return View();
        }

        public JsonResult CancelledPRs()
        {
            List<object> objList = new List<object>();

            var result = _managePRRepository.GetPRs().Where(a => a.StatusID == 10).Select(a => new { o = a, TransactionDate = _managePRRepository.GetLogsByID(a.PurchaseRequestID).Last().TransactionDate });
            string role = Convert.ToString(Session["Role"]);
            int officeID = Convert.ToInt32(Session["OfficeID"]);
            if (role != "Administrator")
            {
                result = result.Where(a => a.o.UserAccount.OfficeID == officeID);
            }
            foreach (var item in result)
            {
                var datePrepared = item.o.DatePrepared;
                var datePRAssigned = item.o.DatePRAssigned;
                var obj = new
                {
                    PurchaseRequestID = item.o.PurchaseRequestID,
                    ControlNumber = item.o.ControlNumber,
                    PRNumber = item.o.PRNumber,
                    DatePrepared = datePrepared == null ? "" : datePrepared.Value.ToShortDateString() + " " + datePrepared.Value.ToShortTimeString(),
                    DatePRPrepared = datePRAssigned == null ? "" : datePRAssigned.Value.ToShortDateString(),
                    DivisionName = item.o.Division.DivisionName,
                    Purpose = item.o.Purpose,
                    TransactionTypeID = item.o.TransactionTypeID,
                    TransactionType = item.o.TransactionType.TransactionType1,
                    Amount = Convert.ToDecimal(item.o.Amount).ToString("N2"),
                    Supplier = 0,
                    Status = item.o.Status == null ? "Preparing..." : item.o.Status.Status1,
                    Remarks = item.o.Remarks,
                };
                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPRList()
        {
            List<object> objList = new List<object>();
            var result = _managePRRepository.GetPRs().Where(a => a.StatusID != 10).Select(a => new { o = a, TransactionDate = _managePRRepository.GetLogsByID(a.PurchaseRequestID).Last().TransactionDate });
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");

            foreach (var item in result)
            {
                var datePrepared = item.o.DatePrepared;
                var datePRAssigned = item.o.DatePRAssigned;
                var obj = new
                {
                    PurchaseRequestID = item.o.PurchaseRequestID,
                    ControlNumber = item.o.ControlNumber,
                    PRNumber = item.o.PRNumber,
                    DatePrepared = datePrepared == null ? "" : datePrepared.Value.ToShortDateString() + " " + datePrepared.Value.ToShortTimeString(),
                    DatePRPrepared = datePRAssigned == null ? "" : datePRAssigned.Value.ToShortDateString(),
                    DivisionName = item.o.Division.DivisionName,
                    Purpose = item.o.Purpose,
                    TransactionTypeID = item.o.TransactionTypeID,
                    TransactionType = item.o.TransactionType.TransactionType1,
                    Amount = Convert.ToDecimal(item.o.Amount).ToString("N2"),
                    Supplier = 0,
                    Status = item.o.Status == null ? "Preparing..." : item.o.Status.Status1,
                    Remarks = item.o.Remarks,
                    TransactionDate = item.TransactionDate,
                };
                objList.Add(obj);
            }

            //var res = result.Select(item => new {
            //    PurchaseRequestID = item.o.PurchaseRequestID,
            //    ControlNumber = item.o.ControlNumber,
            //    PRNumber = item.o.PRNumber,
            //    DatePrepared ="",// item.o.DatePrepared.Value.ToShortTimeString(),
            //    DatePRPrepared = "",//item.o.DatePRAssigned.Value.ToShortDateString(),
            //    DivisionName = item.o.Division.DivisionName,
            //    Purpose = item.o.Purpose,
            //    TransactionTypeID = item.o.TransactionTypeID,
            //    TransactionType = item.o.TransactionType.TransactionType1,
            //    Amount = Convert.ToDecimal(item.o.Amount).ToString("N2"),
            //    Supplier = 0,
            //    Status = item.o.Status == null ? "Preparing..." : item.o.Status.Status1,
            //    Remarks = item.o.Remarks,
            //    TransactionDate = item.TransactionDate,
            //});
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetOnProcessPRs()
        {
            List<object> objList = new List<object>();
            List<int> exlude = new List<int> { 15, 14, 10, 9 };
            var result = _managePRRepository.GetPRs().Where(a => !exlude.Contains(Convert.ToInt32(a.StatusID))).Select(a => new { o = a, TransactionDate = _managePRRepository.GetLogsByID(a.PurchaseRequestID).Last().TransactionDate });

            string role = Convert.ToString(Session["Role"]);
            int officeID = Convert.ToInt32(Session["OfficeID"]);
            if (role != "Administrator")
            {
                result = result.Where(a => a.o.Status.OfficeID == officeID);
            }

            foreach (var item in result)
            {
                var datePrepared = item.o.DatePrepared;
                var datePRAssigned = item.o.DatePRAssigned;
                var obj = new
                {
                    PurchaseRequestID = item.o.PurchaseRequestID,
                    ControlNumber = item.o.ControlNumber,
                    PRNumber = item.o.PRNumber,
                    DatePrepared = datePrepared == null ? "" : datePrepared.Value.ToShortDateString() + " " + datePrepared.Value.ToShortTimeString(),
                    DatePRPrepared = datePRAssigned == null ? "" : datePRAssigned.Value.ToShortDateString(),
                    DivisionName = item.o.Division.DivisionName,
                    Purpose = item.o.Purpose,
                    TransactionType = item.o.TransactionType.TransactionType1,
                    TransactionTypeID = item.o.TransactionTypeID,
                    Amount = Convert.ToDecimal(item.o.Amount).ToString("N2"),
                    Supplier = 0,
                    Status = item.o.Status == null ? "" : item.o.Status.Status1,
                    Remarks = item.o.Remarks,
                    IsReceived = item.o.IsReceived == null ? false : item.o.IsReceived,
                    item.TransactionDate,
                };
                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPOs()
        {
            List<object> objList = new List<object>();
            var result = _managePRRepository.GetPOs().OrderByDescending(a => a.PurchaseOrderDate);

            string role = Convert.ToString(Session["Role"]);
            int officeID = Convert.ToInt32(Session["OfficeID"]);
            //if (role != "Administrator")
            //{
            //    result = result.Where(a => a.Status.OfficeID == officeID);
            //}

            foreach (var item in result)
            {
                var datePrepared = item.PurchaseRequest.DatePrepared;
                var datePRAssigned = item.PurchaseRequest.DatePRAssigned;
                var obj = new
                {
                    item.PurchaseRequestID,
                    item.PurchaseOrderID,
                    item.PurchaseRequest.PRNumber,
                    DatePRPrepared = datePRAssigned == null ? "" : datePRAssigned.Value.ToShortDateString(),
                    DivisionName = item.PurchaseRequest.Division.DivisionName,
                    Purpose = item.PurchaseRequest.Purpose,
                    TransactionType = item.PurchaseRequest.TransactionType.TransactionType1,
                    TransactionTypeID = item.PurchaseRequest.TransactionTypeID,
                    Amount = Convert.ToDecimal(item.Amount).ToString("N2"),
                    Remarks = item.PurchaseRequest.Remarks,
                    item.Supplier.SupplierName,
                    item.ModeofProcurement,
                    item.PlaceofDelivery,
                    item.DateofDelivery,
                };
                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPRItems(int PurchaseRequestID)
        {
            var purchaseRequestDetail = _managePRRepository.GetPRItems(PurchaseRequestID);
            return Json(new
            {

                data = purchaseRequestDetail.Select(a => new
                {
                    a.PurchaseRequestDetailID,
                    PurchaseRequestID = 0,
                    ActivityDate = a.ActivityDate == null ? "" : a.ActivityDate.Value.ToString("MM/dd/yyyy"),
                    a.ItemName,
                    a.Specification,
                    a.Unit,
                    a.Quantity,
                    a.UnitCost,
                    TotalCost = Convert.ToDecimal(a.TotalCost).ToString("N2"),
                }).ToList()
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPRStatus()
        {
            var divisionID = Convert.ToInt32(Session["DivisionID"]);
            var officeID = Convert.ToInt32(Session["OfficeID"]);
            var PRs = _managePRRepository.GetPRStatus(divisionID);

            List<int> exlude = new List<int> { 15, 14, 10, 9 };
            return Json(new
            {
                Preparing = PRs.Count(a => a.StatusID == 15),
                OnProcessDivision = PRs.Count(a => !exlude.Contains(Convert.ToInt32(a.StatusID))),
                Returned = PRs.Count(a => a.StatusID == 9),
                OnProcess = _managePRRepository.GetPRs().Where(a => a.Status.OfficeID == officeID).Count(),
                ForPurchaseOrder = _managePRRepository.GetPRs().Where(a => a.StatusID == 6).Count(),
                ForORSDV = _managePRRepository.GetPRs().Where(a => a.StatusID == 23).Count(),
            }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetSuppliers(int PurchaseRequestID)
        {
            ViewBag.Suppliers = new SelectList(_unitOfWork.CanvassRepository.Entities.ToList().Select(a => new { a.SupplierID, a.Supplier.SupplierName, a.PurchaseRequestID }).Where(a => a.PurchaseRequestID == PurchaseRequestID), "SupplierID", "SupplierName");
            return PartialView();
        }

        public ActionResult reviveSession()
        {
            Session["DateNow"] = DateTime.Now;
            return Json(new
            {
                userID = Session["UserID"]
            }, JsonRequestBehavior.AllowGet);
        }
    }
}