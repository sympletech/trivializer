using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace WCFServiceWebRole1
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "ITrivia" in both code and config file together.
    [ServiceContract]
    public interface ITrivia
    {
        [OperationContract]
        void DoWork();

         //User venue functions
        [OperationContract]
        VenueInfo GetVenueData(int value);
        [OperationContract]
        PlayerRankingAtVenue GetRankingsOfVenue(int VenueId);
        [OperationContract]
        string GetCurrentGameList(int value);

        //Game specific functions
        [OperationContract]
        TriviaQuestion GetQuestion(int value);
        [OperationContract]
        void SubmitAnswer(AnswerSubmission value);
        [OperationContract]
        PlayerRankingAtVenue PollGameMembers(PlayerInfo value);


        //Advertising & venue functions
        [OperationContract]
        string SubmitPlayerInfo(int value);
        [OperationContract]
        string SubmitPhoneInfo(int value);
        [OperationContract]
        string ChannelPartners(int value);

    }


    // Use a data contract as illustrated in the sample below to add composite types to service operations.
    [DataContract]
    public class CompositeType
    {
        bool boolValue = true;
        string stringValue = "Hello ";

        [DataMember]
        public bool BoolValue
        {
            get { return boolValue; }
            set { boolValue = value; }
        }

        [DataMember]
        public string StringValue
        {
            get { return stringValue; }
            set { stringValue = value; }
        }
    }

    //User to poll game members
    [DataContract]
    public class PlayerInfo
    {
        int CurrentPlayer = 0;
        int CurrentGame = 0;

        [DataMember]
        public int PlayerId
        {
            get
            {
                return CurrentPlayer;
            }
            set
            {
                CurrentPlayer = value;
            }
        }

        [DataMember]
        public int GameId
        {
            get
            {
                return CurrentGame;
            }
            set
            {
                CurrentGame = value;
            }
        }
    }

    //Venue Information
    [DataContract]
    public class VenueInfo
    {
        string Name = "";
        int VeneuType = 0;

        [DataMember]
        public string VenueName
        {
            get
            {
                return Name;
            }
            set
            {
                Name = value;
            }
        }

        [DataMember]
        public int VenueTypeId
        {
            get
            {
                return VeneuType;
            }
            set
            {
                VeneuType = value;
            }
        }
    }

    //Veneu player ranking
    [DataContract]
    public class PlayerRankingAtVenue
    {
        string PlayerOne = "";
        string PlayerTwo = "";
        string PlayerThree = "";
        string PlayerFour = "";
        string PlayerFive = "";

        int PlayerOneScore = 0;
        int PlayerTwoScore = 0;
        int PlayerThreeScore = 0;
        int PlayerFourScore = 0;
        int PlayerFiveScore = 0;

        [DataMember]
        public string PlayerOneName
        {
            get
            {
                return PlayerOne;
            }
            set
            {
                PlayerOne = value;
            }
        }

        [DataMember]
        public string PlayerTwoName
        {
            get
            {
                return PlayerTwo;
            }
            set
            {
                PlayerTwo = value;
            }
        }

        [DataMember]
        public string PlayerThreeName
        {
            get
            {
                return PlayerThree;
            }
            set
            {
                PlayerThree = value;
            }
        }

        [DataMember]
        public string PlayerFourName
        {
            get
            {
                return PlayerFour;
            }
            set
            {
                PlayerFour = value;
            }
        }

        [DataMember]
        public string PlayerFiveName
        {
            get
            {
                return PlayerFive;
            }
            set
            {
                PlayerFive = value;
            }
        }

        [DataMember]
        public int PlayerOneRank
        {
            get
            {
                return PlayerOneScore;
            }
            set
            {
                PlayerOneScore = value;
            }
        }

        [DataMember]
        public int PlayerTwoRank
        {
            get
            {
                return PlayerTwoScore;
            }
            set
            {
                PlayerTwoScore = value;
            }

        }

        [DataMember]
        public int PlayerThreeRank
        {
            get
            {
                return PlayerThreeScore;
            }
            set
            {
                PlayerThreeScore = value;
            }
        }

        [DataMember]
        public int PlayerFourRank
        {
            get
            {
                return PlayerFourScore;
            }
            set
            {
                PlayerFourScore = value;
            }
        }

        [DataMember]
        public int PlayerFiveRank
        {
            get
            {
                return PlayerFiveScore;
            }
            set
            {
                PlayerFiveScore = value;
            }
        }
    }

    //Game questions and answer
    [DataContract]
    public class TriviaQuestion
    {
        string Question = "";
        string AnswerOne = "";
        string AnswerTwo = "";
        string AnswerThree = "";
        string AnswerFour = "";

        int CorrectAnswer = 0;

        [DataMember]
        public string TriviaQuestion
        {
            get
            {
                return Question;
            }
            set
            {
                Question = value;
            }
        }

        [DataMember]
        public string OptionOne
        {
            get
            {
                return AnswerOne;
            }
            set
            {
                AnswerOne = value;
            }
        }

        [DataMember]
        public string OptionTwo
        {
            get
            {
                return AnswerTwo;
            }
            set
            {
                AnswerTwo = value;
            }
        }

        [DataMember]
        public string OptionTree
        {
            get
            {
                return AnswerThree;
            }
            set
            {
                AnswerThree = value;
            }
        }

        [DataMember]
        public string OptionFour
        {
            get
            {
                return AnswerFour;
            }
            set
            {
                AnswerFour = value;
            }
        }

        [DataMember]
        public int CorrectOPtion
        {
            get
            {
                return CorrectAnswer;
            }
            set
            {
                CorrectAnswer = value;
            }
        }
    }

    //Correct answer submission
    [DataContract]
    public class AnswerSubmission
    {
        int Question = 0;
        int UserId = 0;

        [DataMember]
        public int QuestionNumer
        {
            get
            {
                return Question;
            }
            set
            {
                Question = value;
            }
        }

        [DataMember]
        public int Player
        {
            get
            {
                return UserId;
            }
            set
            {
                UserId = value;
            }
        }
    }

    }
}
