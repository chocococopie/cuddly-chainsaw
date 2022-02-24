import select2 from "select2";
window.select2 = select2();

$(document).ready(function () {
	$('.select').select2({
		minimumResultsForSearch: Infinity,
	});
});
