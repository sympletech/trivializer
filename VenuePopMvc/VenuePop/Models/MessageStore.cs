using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VenuePop.Models
{
    public class MessageStore
    {
        public static List<Message> GetMessages()
        {
            var msg = HttpContext.Current.Session["messages"] as List<Message>;
            if (msg == null)
            {
                msg = new List<Message>();
            }
            return msg;
        }

        public static void Add(Message message)
        {
            var msg = HttpContext.Current.Session["messages"] as List<Message>;
            if (msg == null)
            {
                msg = new List<Message>();
            }
            msg.Add(message);
            HttpContext.Current.Session["messages"] = msg;
        }
    }
}