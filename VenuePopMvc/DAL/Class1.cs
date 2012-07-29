using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using CorrugatedIron;
using CorrugatedIron.Models;

namespace DAL
{




    public class PictureManager
    {

       


        public bool PutMessage(string key, string venue, string message)
        {
            var cluster = RiakCluster.FromConfig("riakConfig");
            var client = cluster.CreateClient();
            IEnumerable<RiakObject> listOfMessages = new List<RiakObject>() {  new RiakObject("_images", venue + "_" + key, message) };

            var value = client.Put(listOfMessages);


            return true;
        }


    }
}
