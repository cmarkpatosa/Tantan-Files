using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SMIS
{
    public interface IUnitOfWork
    {
        /// <summary>
        /// Commits all changes
        /// </summary>
        void Commit();
        
        /// <summary>
        /// Discards all changes that has not been commited
        /// </summary>
        void RejectChanges();

        void Dispose();
    }
}
