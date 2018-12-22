function check(form) {
	if(form.username.value==''){
		document.getElementById('usernameError').innerHTML="请输入账号";
		form.username.focus();
		return false;
	}
	if(form.pwd.value==''){
		document.getElementById('pwdError').innerHTML="请输入密码";
		form.pwd.focus();
		return false;
	}return true;
}

function Registercheck(form){
	if(form.Registerusername.value==''){
		document.getElementById('usernameError').innerHTML="请输入账号";
		form.Registerusername.focus();
		return false;
	}
	if(form.Registerpwd1.value==''){
		document.getElementById('pwdError1').innerHTML="请输入密码";
		form.Registerpwd1.focus();
		return false;
	}
	if(form.Registerpwd2.value==''){
		document.getElementById('pwdError2').innerHTML="请输入密码";
		form.Registerpwd2.focus();
		return false;
	}return true;
}
