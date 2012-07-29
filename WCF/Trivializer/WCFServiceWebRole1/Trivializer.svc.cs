using System;
using System.Collections.Generic;
using System.Data.Services;
using System.Data.Services.Common;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;
using System.ComponentModel.Design.Serialization;
using System.Web.Script.Serialization;

namespace WCFServiceWebRole1
{
    public class Trivializer : DataService<TrivializerEntities>
    {
        // This method is called only once to initialize service-wide policies.
        public static void InitializeService(DataServiceConfiguration config)
        {
            // TODO: set rules to indicate which entity sets and service operations are visible, updatable, etc.
            // Examples:
            config.SetEntitySetAccessRule("Companies", EntitySetRights.All);
            config.SetEntitySetAccessRule("Games", EntitySetRights.AllRead);
            config.SetEntitySetAccessRule("Questions", EntitySetRights.AllRead);
            config.SetEntitySetAccessRule("Companies", EntitySetRights.All);
            config.SetEntitySetAccessRule("Rankings", EntitySetRights.AllRead);
            config.SetEntitySetAccessRule("Venues", EntitySetRights.AllRead);
            // config.SetServiceOperationAccessRule("MyServiceOperation", ServiceOperationRights.All);
            config.DataServiceBehavior.MaxProtocolVersion = DataServiceProtocolVersion.V2;
        }
    }
}
