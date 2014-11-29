$(document).ready(function() {
    $.ajax({
            url: '/admin/event',
            success: function(data) {

                if (data.tickets) {
                    $.each(data.tickets, function(key, value) {
                        $('.view').append($('<div/>', {html: key + ": " + value.length}));
                    })
                }

                $('#price').val(data.event.price.integral + '.' + data.event.price.fractional);
                $.each(data.event.promocodes, function(key, value) {
                    $('#change-form h3').after(
                        $('<div/>', {
                            class: 'form-group  discounts'
                        }).append(
                            $('<input/>', {
                                type: 'text',
                                name: key + "_key",
                                value: key
                            })
                        ).append(
                            $('<input/>', {
                                type: 'number',
                                id: key + "_value",
                                value: value
                            })
                        )
                    );
                })

            }
        }
    );
});

$(document).on('click', '#add-promo', function() {
    var key = Math.random() * 100;

    $('#change-form h3').after(
        $('<div/>', {
            class: 'form-group discounts'
        }).append(
            $('<input/>', {
                type: 'text',
                id: key + "_name"
            })
        ).append(
            $('<input/>', {
                type: 'number',
                id: key + "_value"
            })
        )
    );
});

$(document).on('click', '#proceed-change', function() {
    $.ajax(
        {
            method: 'POST',
            timeout: 30000,
            url: '/admin',
            contentType: "application/json",
            data: (function() {
                var discounts = {};

                $('.discounts').each(function(index, item) {
                    discounts[$(item).find('[id$="_name"]').val()] = $(item).find('[id$="_value"]').val();
                });

                return JSON.stringify({
                    price: $('#price').val(),
                    discounts: discounts
                })
            })(),
            error: function(xhr, status) {
                if (status === 'timeout') {
                    return renderAlert('danger', 'Упс, таймаут.');
                }

                renderAlert('danger', xhr.responseText);
            },
            success: function(data) {
                // no time :(
            }
        }
    );
});