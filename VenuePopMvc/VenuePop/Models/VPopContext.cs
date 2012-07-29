using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace VenuePop.Models
{
    public class VPopContext : DbContext 
    {
        public DbSet<Message> Messages { get; set; }
    }
}