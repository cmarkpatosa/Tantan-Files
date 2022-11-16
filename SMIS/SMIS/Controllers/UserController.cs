using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SMIS.Controllers
{
    public class UserController : Controller
    {
        // GET: User
        SMISEntities db = new SMISEntities();
        public ActionResult Login()
        {
            return View();
        }

        public ActionResult Register()
        {
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
            return View();
        }

        //public ActionResult Profile()
        //{
        //    ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
        //    ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
        //    return View();
        //}

        public ActionResult Lockscreen()
        {
            ViewBag.Message = "Your application description page.";
            return View();
        }

        public ActionResult UserList()
        {
            ViewBag.Offices = new SelectList(db.Offices.ToList(), "OfficeID", "OfficeName");
            ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
            return View();
        }

        public ActionResult SaveUser(UserAccount userAccount)
        {
            if (userAccount.UserID == 0)
            {
                var list = db.UserAccounts.Where(a => a.Username == userAccount.Username).Count();
                if (list == 0)
                {
                    db.UserAccounts.Add(userAccount);
                    db.SaveChanges();
                    if (userAccount.Role == null)
                    {
                        ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
                        ViewBag.Result = "You have successfully register, kindly ask approval of your account to the site administrator...";
                        return View("Register");
                    }
                }
                else {
                    ViewBag.Divisions = new SelectList(db.Divisions.ToList(), "DivisionID", "DivisionName");
                    ViewBag.Result = "Username Already Exist, Please try again!";
                    return View("Register");
                }
               
                
                return Json(new { message = "Successfully saved...", success = true }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                var obj = db.UserAccounts.SingleOrDefault(a => a.UserID == userAccount.UserID);
                obj.Position = userAccount.Position;
                obj.AccountName = userAccount.AccountName;
                obj.Username = userAccount.Username;
                obj.Password = userAccount.Password;
                obj.DivisionID = userAccount.DivisionID;
                obj.OfficeID = userAccount.OfficeID;
                obj.Role = userAccount.Role;
                db.SaveChanges();
                return Json(new { message = "Successfully updated", success = true }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetUserList()
        {
            List<object> objList = new List<object>();
            var result = db.UserAccounts.ToList();

            foreach (var item in result)
            {
                var obj = new
                {
                    item.UserID,
                    item.Username,
                    item.AccountName,
                    item.Division.DivisionName,
                    OfficeName = item.Office == null ? "" : item.Office.OfficeName,
                    item.Role,
                    item.Password,
                    item.DivisionID,
                    item.OfficeID
                };
                objList.Add(obj);
            }
            return Json(new { data = objList }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Loggedin(UserAccount userAccount)
        {
            var user = db.UserAccounts.SingleOrDefault(a => a.Username == userAccount.Username && a.Password == userAccount.Password);
            if (user == null)
            {
                ViewBag.Message = "Incorrect Username or Password!";
                return View("Login");
            }
            else if (user.Role == null)
            {
                ViewBag.Message = "Please request account approval to the Site Administrator.";
                return View("Login");
            }
            else
            {
                int userID = user.UserID;
                Session["AccountName"] = user.AccountName;
                Session["UserID"] = userID;
                Session["Role"] = user.Role;
                Session["DivisionID"] = user.DivisionID;
                Session["OfficeID"] = user.OfficeID;
                return RedirectToAction("Index", "Dashboard");
            }
        }

        public ActionResult Logout()
        {
            Session["UserID"] = 0;
            Session["Role"] = 0;
            Session["DivisionID"] = 0;
            Session["OfficeID"] = 0;
            return RedirectToAction("Login", "User");
        }

    }
}