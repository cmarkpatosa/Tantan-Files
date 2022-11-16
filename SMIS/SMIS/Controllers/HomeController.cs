using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SMIS.Controllers
{
    public class HomeController : Controller
    {
        SMISEntities db = new SMISEntities();
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Loggedin(UserAccount userAccount)
        {
            int userID = userAccount.UserID;
            var user = db.UserAccounts.SingleOrDefault(a => a.UserID == userID);

            Session["UserID"] = userID;
            Session["Role"] = user.Role;
            Session["DivisionID"] = user.DivisionID;
            Session["OfficeID"] = user.OfficeID;
            return RedirectToAction("PRList", "ManagePR");
        }

        [HttpPost]
        public ActionResult Logout()
        {
            Session["UserID"] = 0;
            Session["Role"] = 0;
            Session["DivisionID"] = 0;
            Session["OfficeID"] = 0;
            return RedirectToAction("Login", "Home");
        }

        public ActionResult Lockscreen()
        {
            ViewBag.Message = "Your application description page.";
            return View();
        }

        public ActionResult Dashboard()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}