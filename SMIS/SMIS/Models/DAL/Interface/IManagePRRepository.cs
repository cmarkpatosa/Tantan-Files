using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SMIS.Models
{
    interface IManagePRRepository : IDisposable
    {
        IEnumerable<PurchaseRequest> GetPRs();
        IEnumerable<PurchaseOrder> GetPOs();
        Canvass GetCanvass(int canvassID);
        IEnumerable<CanvassDetail> GetCanvassDetailList(int canvassID);
        IEnumerable<Canvass> GetCanvassList();
        PurchaseRequest GetPR(int purchaseRequestID);
        List<PurchaseRequestDetail> GetPRItems(int purchaseRequestID);
        IEnumerable<Log> GetLogsByID(int purchaseRequestID);
        IEnumerable<Log> GetLogs();
        IEnumerable<PurchaseRequest> GetPRStatus(int divisionID);
        string Save(PurchaseRequest purchaseRequest, List<PurchaseRequestDetail> purchaseRequestDetail);
        string Save(PurchaseOrder purchaseOrder, List<PurchaseOrderDetail> purchaseOrderDetail);
        string Delete(int purchaseRequestID);
        string SubmitPR(Log logs);
        string SetPRNumber(int purchaseRequestID, string PRNumber, string PRDate);
        string ForRevision(int purchaseRequestID, bool forRevision);

    }


}
