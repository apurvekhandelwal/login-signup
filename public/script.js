function saveUserData() {
    const userData = {
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        mobile: $('#mobile').val(),
        email: $('#email').val(),
        address: {
            street: $('#street').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            country: $('#country').val()
        },
        loginId: $('#loginId').val(),
        password: $('#password').val()
    };

    $.ajax({
        type: 'POST',
        url: 'https://user-service-pib9.onrender.com/',
        data: JSON.stringify(userData),
        contentType: 'application/json',
        success: function (response) {
            alert(response);
            $('#userForm')[0].reset();
            window.location.href = "https://user-service-pib9.onrender.com/users";
        },
        error: function (error) {
            console.error(error);
            alert('please provide right data');
        }
    });
}


