using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using VenuePop.Models;

namespace VenuePop.Controllers
{
    public class MessageController : ApiController
    {
        public List<Message> GetMessages()
        {
            using (var db = new VPopContext())
            {
                return db.Messages.ToList();
            }
        }
    }
}
