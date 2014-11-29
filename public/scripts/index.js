/**
 * Created by katsanva on 02.10.2014.
 */

function renderAlert(level, text) {
    $('.alert').remove();

    $('.view').append($('<div/>', {
        class: 'alert alert-' + level,
        html: text || 'На жаль не можна відобразити дані, спробуйте пізніше.'
    })).
        animate({
            width: 'toggle',
            height: 'toggle'
        });
}

$(document).ready(function() {
    var val = parseInt($('#amount').val(), 10);

    for (var i = 0; i < 5; i++) {
        var html = '<div class="row identity">\
        <div class="col-xs-6">\
    <div class="form-group">\
        <label for="identity_' + i + '_name">Ім\'я</label>\
        <input type="text" name="identity[][name]" class="form-control" id="identity_' + i + '_name">\
        </div>\
    </div>\
    <div class="col-xs-6">\
    <div class="form-group">\
        <label for="identity_' + i + '_surname">Призвіще</label>\
        <input type="text" name="identity[][surname]" class="form-control" id="identity_' + i + '_surname">\
        </div>\
    </div>\
    </div>';

        $('#proceed-checkout').before(html);
    }

    $('.identity:first').show();
});

$(document).on('click', '#proceed-checkout', function() {
    var val = parseInt($('#amount').val(), 10);

    if (!val || $(".identity:visible").length !== val) {
        return false;
    }

    $.ajax(
        {
            method: 'POST',
            timeout: 30000,
            url: '/',
            contentType: "application/json",
            data: (function() {
                var identity = [],
                    val = parseInt($('#amount').val());

                $('.identity').each(function(index, item) {
                    identity.push(
                        {
                            name: $(item).find('[id$="_name"]').val(),
                            surname: $(item).find('[id$="_surname"]').val()
                        }
                    )
                });

                return JSON.stringify({
                    amount: val,
                    promo: $('#promo-code').val(),
                    identity: identity.slice(0, parseInt(val))
                })
            })(),
            error: function(xhr, status) {
                if (status === 'timeout') {
                    return renderAlert('danger', 'Упс, таймаут.');
                }

                renderAlert('danger', xhr.responseText);
            },
            success: function(data) {
                if (data && data.order) {
                    window.location.hash = data.order._id;

                    $('#order').hide();
                    $('#checkout').show();

                    $('.total span').html(data.order.total);

                }
            }
        }
    );
});

$(document).on('click', '#make-checkout', function() {
/*var regexp = /^4\d{3}([\ \-]?)\d{4}\1\d{4}\1\d{4}$/;


    return console.log( regexp.test($("#card-id").val()));*/
console.log(window.location.hash)

    $.ajax(
        {
            method: 'POST',
            timeout: 30000,
            url: '/order/' + window.location.hash.replace('#', ''),
            contentType: "application/json",
            data: JSON.stringify({
                card: $("#card-id").val(),
                email: $("#email").val()
            }),
            error: function(xhr, status) {
                if (status === 'timeout') {
                    return renderAlert('danger', 'Упс, таймаут.');
                }

                renderAlert('danger', xhr.responseText);
            },
            success: function(data) {
                console.log(data);
            }
        }
    );
});

$(document).on('change', '#amount', function() {
    var self = $(this);

    var val = parseInt(self.val(), 10),
        min = parseInt(self.attr('min'), 10),
        max = parseInt(self.attr('max'), 10);

    if (val > max) {
        self.val(max);
        val = max;
    }

    if (val < min) {
        self.val(min);
        val = min;
    }

    var identity = $('.identity');

    $.each(identity, function(index, item) {
        $(item).css('display', index < val ? 'block' : 'none')
    });
});

