using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace SMIS
{
    public class Notification : Hub
    {

        SMISEntities db = new SMISEntities();
        public Notification()
        {
            this.db = new SMISEntities();
        }

        public void NotifyUser()
        {
            Clients.All.notify("hi!");
        }
        public void ClearCache(int interval, string message)
        {
            Clients.All.clear(interval, message);
        }

        public void SystemMessage(string message)
        {
            Clients.All.message(message);
        }

        public void DesktopNotification(int PurchaseRequestID)
        {
            var PR = db.PurchaseRequests.SingleOrDefault(a => a.PurchaseRequestID == PurchaseRequestID);
            Clients.All.sendNotification("You have on process PR with Control Number " + PR.ControlNumber + " " + PR.Status.Status1, PR.Status.OfficeID, PR.DivisionID);
        }
    }
}