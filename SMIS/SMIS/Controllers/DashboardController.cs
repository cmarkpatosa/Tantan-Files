using SMIS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SMIS.Controllers
{
    public class DashboardController : Controller
    {
        SMISEntities db = new SMISEntities();

        private IManagePRRepository _managePRRepository;
        public DashboardController()
        {
            this.db = new SMISEntities();
            this._managePRRepository = new ManagePRRepository();
        }

        // GET: Dashboard
        public ActionResult Index( int year = 0)
        {
            if (year == 0) year = DateTime.Now.Year;
            ViewBag.year = year;
            var PRs = _managePRRepository.GetPRs().Where(a => a.DatePrepared.Value.Year == year);
            ViewBag.Completed = PRs.Where(a => a.StatusID == 28).Count();
            ViewBag.Prepared = PRs.Where(a => a.StatusID == 15).Count();
            ViewBag.OnProcess = PRs.Where(a => a.StatusID != 15 && a.StatusID != 14 && a.StatusID != 10 && a.StatusID != 6 && a.StatusID != 28).Count();
            ViewBag.ForPurchaseOrder = PRs.Where(a => a.StatusID == 6).Count();
            ViewBag.Returned = PRs.Where(a => a.StatusID == 9).Count();

            ViewBag.RecentActivities = PRs.OrderByDescending(a=> a.Logs.LastOrDefault().TransactionDate).Select(o => new
            {
                AccountName = db.UserAccounts.FirstOrDefault(a => a.UserID == o.UserID).AccountName,
                Purpose = o.Purpose,
                DateSubmitted = o.Logs.LastOrDefault().TransactionDate,
                Status = o.Status.Status1,
                DivisionName = o.Division.DivisionName,
                Amount = o.Amount,
                Remarks = o.Logs.LastOrDefault().Remarks
            }).ToList<object>().Take(6);

            var OnProcessSummary = _managePRRepository.GetPRs();
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

        public JsonResult GetPRStatus(int year =0) {

            if (year == 0) year = DateTime.Now.Year;

            var list = new List<object>();
            int[] Ids = { 14, 10 }; // 15
            var statusList = db.Status.Where(a => !Ids.Contains(a.StatusID)).OrderBy(a=> a.Step).ToList();
            foreach (var item in db.Divisions.ToList())
            {
                int[] d = new int[statusList.Count()];
                int count = 0;
                foreach (var statuses in statusList)
                {
                    d[count] = (db.PurchaseRequests.Where(a => a.StatusID == statuses.StatusID && a.Division.DivisionName == item.DivisionName && a.DatePrepared.Value.Year == year).Count());
                    count++;
                }

                var o = new
                {
                    label = item.DivisionName,
                    backgroundColor = item.DivisionColor,
                    borderColor = "#000000",
                    data = d
                };
                list.Add(o);
            }

            var labelResult = new List<object>();
            foreach (var statuses in statusList)
            {
                labelResult.Add(statuses.Status1);
            }

            return Json(new {
                labels = labelResult,
                datasets = list
            }, JsonRequestBehavior.AllowGet);
        }

    }
}