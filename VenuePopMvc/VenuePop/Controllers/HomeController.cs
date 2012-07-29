using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VenuePop.Models;

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

        [HttpPost]
        public ActionResult Admin(Message message)
        {
            var x =new DAL.PictureManager();
            x.PutMessage("Mikes Key", "1", message.Text);

            using (VPopContext db = new VPopContext())
            {
                db.Messages.Add(message);
                db.SaveChanges();
                return Content("Saved");
            }
        }

    }
}
