using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace SMIS.Models
{
    public class ManagePRRepository : IManagePRRepository
    {
        private SMISEntities db;

        public ManagePRRepository()
        {
            this.db = new SMISEntities();
            this.db.Configuration.LazyLoadingEnabled = true;
            this.db.Configuration.ProxyCreationEnabled = true;
        }

        public string Delete(int purchaseRequestID)
        {
            db.PurchaseRequests.Remove(GetPR(purchaseRequestID));
            db.SaveChanges();
            return "Successfuly deleted...";
        }

        public PurchaseRequest GetPR(int purchaseRequestID)
        {
            db.Configuration.LazyLoadingEnabled = false;
            db.Configuration.ProxyCreationEnabled = false;
            return db.PurchaseRequests.FirstOrDefault(a => a.PurchaseRequestID == purchaseRequestID);
        }
        public List<PurchaseRequestDetail> GetPRItems(int purchaseRequestID)
        {
            db.Configuration.LazyLoadingEnabled = false;
            db.Configuration.ProxyCreationEnabled = false;
            return db.PurchaseRequestDetails.Where(a => a.PurchaseRequestID == purchaseRequestID).ToList();
        }

        public IEnumerable<PurchaseRequest> GetPRs()
        {
            return db.PurchaseRequests.ToList();
        }

        public string Save(PurchaseRequest purchaseRequest, List<PurchaseRequestDetail> purchaseRequestDetail)
        {
            var res = "";
            var n = (db.PurchaseRequests.Count() + 1).ToString().Length;
            var seq = db.PurchaseRequests.Count() + 1;
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
                purchaseRequest.ControlNumber = DateTime.Now.Year + "-" + result + "-" + db.Divisions.SingleOrDefault(a => a.DivisionID == purchaseRequest.DivisionID).DivisionName;
                purchaseRequest.Amount = purchaseRequestDetail.Sum(a => a.UnitCost * a.Quantity);
                db.PurchaseRequests.Add(purchaseRequest);
            }
            else
            {
                var obj = purchaseRequest;
                purchaseRequest = db.PurchaseRequests.SingleOrDefault(a => a.PurchaseRequestID == purchaseRequestID);
                purchaseRequest.TransactionTypeID = obj.TransactionTypeID;
                purchaseRequest.Purpose = obj.Purpose;
                purchaseRequest.Amount = purchaseRequestDetail.Where(a => a.PurchaseRequestID != -1).Sum(a => a.UnitCost * a.Quantity);
            }

            db.SaveChanges();


            foreach (var item in purchaseRequestDetail)
            {
                var o = new PurchaseRequestDetail();
                int purchaseRequestDetailID = item.PurchaseRequestDetailID;
                if (item.ActivityDate != null)
                {
                    item.ActivityDate = Convert.ToDateTime(item.ActivityDate);
                }

                if (item.PurchaseRequestID == -1)
                {
                    db.PurchaseRequestDetails.Remove(db.PurchaseRequestDetails.SingleOrDefault(a => a.PurchaseRequestDetailID == item.PurchaseRequestDetailID));
                }
                else if (purchaseRequestDetailID != 0)
                {
                    o = db.PurchaseRequestDetails.SingleOrDefault(a => a.PurchaseRequestDetailID == purchaseRequestDetailID);
                    o.ActivityDate = item.ActivityDate;
                    o.ItemName = item.ItemName;
                    o.Specification = item.Specification;
                    o.Unit = item.Unit;
                    o.Quantity = item.Quantity;
                    o.UnitCost = item.UnitCost;
                }
                else
                {
                    o.PurchaseRequestID = purchaseRequest.PurchaseRequestID;
                    o.ActivityDate = item.ActivityDate;
                    o.ItemName = item.ItemName;
                    o.Specification = item.Specification;
                    o.Unit = item.Unit;
                    o.Quantity = item.Quantity;
                    o.UnitCost = item.UnitCost;
                    db.PurchaseRequestDetails.Add(o);
                }
                db.SaveChanges();
            }

            if (purchaseRequestID == 0)
            {
                Log logs = new Log();
                logs.PurchaseRequestID = Convert.ToInt32(purchaseRequest.PurchaseRequestID);
                logs.StatusID = Convert.ToInt32(purchaseRequest.StatusID);
                logs.TransactionDate = DateTime.Now;
                logs.UserID = Convert.ToInt32(purchaseRequest.UserID);
                logs.Remarks = "Prepared PR " + purchaseRequest.ControlNumber;
                db.Logs.Add(logs);
                db.SaveChanges();
            }
            res = "PR has been successfully saved...";

            return res;
        }

        public string SubmitPR(Log logs)
        {
            logs.PurchaseRequestID = Convert.ToInt32(logs.PurchaseRequestID);
            logs.StatusID = Convert.ToInt32(logs.StatusID);
            logs.TransactionDate = DateTime.Now;
            logs.UserID = Convert.ToInt32(logs.UserID);
            logs.OfficeID = logs.OfficeID;
            logs.Remarks = logs.Remarks;
            db.Logs.Add(logs);
            try
            {
                db.SaveChanges();
            }
            catch (Exception)
            {

                throw;
            }

            //List<int> exlude = new List<int> { 15, 14 };
            if (logs.StatusID != 14)
            {
                var obj = db.PurchaseRequests.SingleOrDefault(a => a.PurchaseRequestID == logs.PurchaseRequestID);
                obj.StatusID = logs.StatusID;
                obj.Remarks = logs.Remarks;
                obj.IsReceived = false;
                db.SaveChanges();
            }
            else if (logs.StatusID == 14)
            {
                var obj = db.PurchaseRequests.SingleOrDefault(a => a.PurchaseRequestID == logs.PurchaseRequestID);
                obj.IsReceived = true;
                obj.Remarks = logs.Remarks;
                db.SaveChanges();
            }

            return "Successfully saved...";
        }




        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls


        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects).
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~PurchaseRequestRepository() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }

        public string SetPRNumber(int purchaseRequestID, string PRNumber, string PRDate)
        {
            //int year = DateTime.Now.Year;
            //int seq = db.PurchaseRequests.Where(a => a.DatePRAssigned != null).Count(a => a.DatePRAssigned.Value.Year == year) + 1;
            //string seqResult = seq.ToString().Length.ToString();
            //switch (seqResult)
            //{
            //    case "1":
            //        seqResult = "000" + seq.ToString();
            //        break;
            //    case "2":
            //        seqResult = "00" + seq.ToString();
            //        break;
            //    case "3":
            //        seqResult = "0" + seq.ToString();
            //        break;
            //    case "4":
            //        seqResult = seq.ToString();
            //        break;
            //}

            var obj = db.PurchaseRequests.SingleOrDefault(a => a.PurchaseRequestID == purchaseRequestID);

            //obj.PRNumber = year + "-" + seqResult;
            obj.PRNumber = PRNumber;
            obj.DatePRAssigned = Convert.ToDateTime(PRDate);
            db.SaveChanges();
            //return "PR Number " + year + seqResult + " successfully assigned";
            return "PR Number " + PRNumber + " successfully assigned";
        }

        public IEnumerable<PurchaseRequest> GetPRStatus(int divisionID)
        {
            return db.PurchaseRequests.Where(a => a.DivisionID == divisionID && a.StatusID != 10).ToList();
        }

        public string ForRevision(int purchaseRequestID, bool forRevision)
        {
            var obj = db.PurchaseRequests.SingleOrDefault(a => a.PurchaseRequestID == purchaseRequestID);
            obj.ForRevision = forRevision;
            db.SaveChanges();
            return "";
        }

        public string Save(PurchaseOrder purchaseOrder, List<PurchaseOrderDetail> purchaseOrderDetail)
        {

            db.PurchaseOrders.Add(purchaseOrder);
            db.SaveChanges();

            foreach (PurchaseOrderDetail item in purchaseOrderDetail)
            {
                item.PurchaseOrderID = purchaseOrder.PurchaseOrderID;
                db.PurchaseOrderDetails.Add(item);
                db.SaveChanges();
            }
            return "PO Successfully saved...";
        }

        public IEnumerable<PurchaseOrder> GetPOs()
        {
            return db.PurchaseOrders.ToList();
        }

        public IEnumerable<Canvass> GetCanvassList()
        {
            return db.Canvasses.ToList();
        }

        public IEnumerable<Log> GetLogsByID(int purchaseRequestID)
        {
            return db.Logs.Where(a => a.PurchaseRequestID == purchaseRequestID).ToList();
        }

        public IEnumerable<Log> GetLogs()
        {
            return db.Logs.ToList();
        }

        public Canvass GetCanvass(int canvassID)
        {
            return db.Canvasses.FirstOrDefault(a => a.CanvassID == canvassID);
        }

        public IEnumerable<CanvassDetail> GetCanvassDetailList(int canvassID)
        {
            return db.CanvassDetails.Where(a => a.CanvassID == canvassID).ToList();
        }
        #endregion
    }
}