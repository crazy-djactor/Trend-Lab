//partial reference to Balta-zar's work on previous cognito version
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var CognitoUser = AmazonCognitoIdentity.CognitoUser;
var AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;

var poolData = {
	UserPoolId : 'us-east-1_NtD0xUrxl',
	ClientId : '708mbg0vsmuv6pfeqc0tsplu9l'
};

function register(){
  if ($('#customCheck1').is(":checked"))
  {
    //get values from the inputs of the form
    let firstname = $('#firstname').val();
    let lastname = $('#lastname').val();
    let email = $('#email').val();
    let password1 = $('#password1').val();
    let password2 = $('#password2').val();

    //console log
    console.log(firstname, lastname, email, password1, password2);

    //signup user on cognito
    var userPool = new CognitoUserPool(poolData);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : email
    };

    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(firstname, lastname, password, attributeList, null, function(err, result){
        if (err) {
            alert(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
    });
  }else{
    alert("Please agree to Terms and Conditions");
  }

}
