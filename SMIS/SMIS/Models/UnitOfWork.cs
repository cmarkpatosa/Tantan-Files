using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace SMIS
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly SMISEntities _dbContext;
        #region Repositories
      
        public IRepository<Division> DivisionRepository =>
        new Repository<Division>(_dbContext);

        public IRepository<PurchaseRequest> PurchaseRequestRepository =>
        new Repository<PurchaseRequest>(_dbContext);
        public IRepository<PurchaseRequestDetail> PurchaseRequestDetailRepository =>
        new Repository<PurchaseRequestDetail>(_dbContext);

        public IRepository<PurchaseOrder> PurchaseOrderRepository =>
        new Repository<PurchaseOrder>(_dbContext);
        public IRepository<Log> LogRepository =>
        new Repository<Log>(_dbContext);
        public IRepository<UserAccount> UserAccountRepository =>
        new Repository<UserAccount>(_dbContext);
        public IRepository<Office> OfficeRepository =>
        new Repository<Office>(_dbContext);


        public IRepository<Canvass> CanvassRepository =>
        new Repository<Canvass>(_dbContext);


        public IRepository<CanvassDetail> CanvassDetailRepository =>
        new Repository<CanvassDetail>(_dbContext);

        #endregion

        public UnitOfWork(SMISEntities dbContext)
        {
            _dbContext = dbContext;
        }
        public void Commit()
        {
            _dbContext.SaveChanges();
        }
        public void Dispose()
        {
            _dbContext.Dispose();
        }
        public void RejectChanges()
        {
            foreach (var entry in _dbContext.ChangeTracker.Entries()
                  .Where(e => e.State != EntityState.Unchanged))
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.State = EntityState.Detached;
                        break;
                    case EntityState.Modified:
                    case EntityState.Deleted:
                        entry.Reload();
                        break;
                }
            }
        }

    }
}