using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using VenuePop.Models;
using System.IO;

namespace VenuePop.Controllers
{
    public class HomeController : Controller
    {


        public ActionResult Index()
        {
            return View();
        }

        public ActionResult List()
        {
            using (VPopContext db = new VPopContext())
            {
                return View(db.Messages.ToList());
            };
        }
        [HttpGet]
        public ActionResult Admin()
        {
            return View();
        }

        public JsonpResult GetMessage()
        {
            return Json(Session["Message"].ToString());
        }

        [HttpPost]
        public ActionResult Admin(Message message)
        {
            Session["Message"] = message.Text;


            var x =new DAL.PictureManager();
            x.PutMessage("Mikes Key", "1", message.Text);

            using (VPopContext db = new VPopContext())
            {
                db.Messages.Add(message);
                db.SaveChanges();
                return Content("Saved");
            }
        }






        public class JsonpResult : System.Web.Mvc.JsonResult
        {
            public override void ExecuteResult(ControllerContext context)
            {
                if (context == null)
                {
                    throw new ArgumentNullException("context");
                }

                HttpResponseBase response = context.HttpContext.Response;

                if (!String.IsNullOrEmpty(ContentType))
                {
                    response.ContentType = ContentType;
                }
                else
                {
                    response.ContentType = "application/javascript";
                }
                if (ContentEncoding != null)
                {
                    response.ContentEncoding = ContentEncoding;
                }
                if (Data != null)
                {
                    // The JavaScriptSerializer type was marked as obsolete prior to .NET Framework 3.5 SP1
#pragma warning disable 0618
                    HttpRequestBase request = context.HttpContext.Request;

                    JavaScriptSerializer serializer = new JavaScriptSerializer();
                    response.Write(request.Params["jsoncallback"] + "(" + serializer.Serialize(Data) + ")");
#pragma warning restore 0618
                }
            }
        }



        protected internal JsonpResult Jsonp(object data)
        {
            return Jsonp(data, null /* contentType */);
        }

        protected internal JsonpResult Jsonp(object data, string contentType)
        {
            return Jsonp(data, contentType, null);
        }

        protected internal virtual JsonpResult Jsonp(object data, string contentType, Encoding contentEncoding)
        {
            return new JsonpResult
            {
                Data = data,
                ContentType = contentType,
                ContentEncoding = contentEncoding
            };
        }

    }
}
