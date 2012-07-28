$(function () {

});

function LoadPages() {
    $('div[data-role="view"]').each(function () {
        var src = $(this).attr('data-src');
        var target = this;
        console.log(src);
        console.log(this);
        if (src != null) {
            $.get(src, function (data) {
                $(target).html(data);
            });
        }
    });
}