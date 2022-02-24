$(document).ready(function () {

	$('.input').focus(function () {
		$(this).parents('.input__wrap').addClass('focused');
	});

	$('.input').blur(function () {
		var inputValue = $(this).val();
		if (inputValue == "") {
			$(this).removeClass('filled');
			$(this).parents('.input__wrap').removeClass('focused');
			$(this).parents('.input__wrap').children('.error').addClass('active');
		} else {
			$(this).addClass('filled');
			$(this).parents('.input__wrap').children('.error').removeClass('active');
		}
	});

	$('#agree').on('change', function () {
		if (!($("#agree").prop('checked'))) {
			$('#submitButton').attr('disabled', true);
		} else {
			$('#submitButton').attr('disabled', false);
		}
	});

	if ($('#toggleMenu').length > 0) {
		$('#toggleMenu').on('click', function () {
			if ($(this).hasClass('isActive')) {
				$(this).removeClass('isActive');
				$(document.body).removeClass('lock');
			} else {
				$(this).addClass('isActive');
				$(document.body).addClass('lock');
			}
		});
	}

});
