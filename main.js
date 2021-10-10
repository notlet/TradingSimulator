// import * as sw from '/modules/sweetalert.min.js'

// Loading screen stuff
function loadScr(showIn, showOut) {
    $('#loading-screen #loadscreentip').text(tips[rng(0, tips.length - 1)]);
    $("#loading-screen").show();
    if (showIn == true) {
        $("#rpart").css("width", "0");
        $("#lpart").css("width", "0");
        $("#lpart").animate({
            width: "+=" + window.innerWidth / 2 + 1
        }, 1000, function () {});
        $("#rpart").animate({
            width: "+=" + window.innerWidth / 2 + 1
        }, 1000, function () {});
        $("#loading-text").fadeIn(1000);
    };
    setTimeout(function () {
        if (showOut == true) {
            $("#lpart").animate({
                width: "-=" + window.innerWidth / 2
            }, 1000, function () {});
            $("#rpart").animate({
                width: "-=" + window.innerWidth / 2
            }, 1000, function () {});
            $("#loading-text").fadeOut(1000);
            setTimeout(function () {
                $("#loading-screen").hide();
            }, 1100);
        };
    }, 2000);
}
// end

// Random number generators
function chance(odds) {

    let chance = []
    for (i = 0; i < 100 - odds; i++) {
        chance.push(0);
    };
    for (i = 0; i < odds; i++) {
        chance.push(1);
    };

    var random = Math.floor(Math.random() * 100);

    if (chance[random] == 1) {
        return 1
    } else {
        return 0
    }

}

function rng(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
}
// end


// Misc functions
function findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function numberspacer(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function arrayToLocalStorage(array, storageKey) {
    var stringArray = JSON.stringify(array);
    localStorage.setItem(storageKey, stringArray);
    return stringArray
}

function arrayFromLocalStorage(storageKey) {
    var stringArray = localStorage.getItem(storageKey);
    return JSON.parse(stringArray)
}

function enablepopup() {
    $('#elementblocker').show()
    $('#popupouter').show().fadeOut(0).fadeIn(500);
    $('.nextdaybtn').css('filter', 'blur(2px)');
    $('#page-content').css('filter', 'blur(2px)')
}

function disablepopup() {
    $('.nextdaybtn').css('filter', 'blur(0px)');
    $('#page-content').css('filter', 'blur(0px)')
    $('#elementblocker').hide()
    $('#popupouter').fadeOut(500).hide();
}
// end

function redraw() {
    var html = ''

    for (i = 0; i < marketstocks.length; i++) {
        goldenstockcheck = ''
        if (marketstocks[i].isGolden == true) goldenstockcheck = ' golden'
        html = html + `<div class="stock${goldenstockcheck}" id="${marketstocks[i].id}">${calculatemarketchange(marketstocks[i].id)}<a id="price">${numberspacer(marketstocks[i].price)}$</a><a id="shortname">${marketstocks[i].id}</a><a id="name">${marketstocks[i].name}</a></div>`
    }
    $(".market .stockslist").html(html);

    html = ''
    for (i = 0; i < ownedstocks.length; i++) {
        html = html + `<div class="stock" id="${ownedstocks[i].id}">${calculateprofit(ownedstocks[i].id)}<a id="price">${numberspacer(ownedstocks[i].price)}$</a><a id="shortname">${ownedstocks[i].id}</a><a id="name">${ownedstocks[i].name}</a><a id="amount">x${numberspacer(ownedstocks[i].amount)}</a></div>`
    }
    $(".inventory .stockslist").html(html);

    $("#moneyval").text(numberspacer(playermoney));

    $('.market .stock').click(function (event) {
        var parentid = $(event.target).parent().attr('id');
        marketstockclick(parentid)
    });
    $('.inventory .stock').click(function (event) {
        var parentid = $(event.target).parent().attr('id');
        inventorystockclick(parentid)
    });

    saveStorageData();
}

function nextday() {
    loadScr(true, true);
    setTimeout(function () {
        for (i = 0; i < marketstocks.length; i++) {
            marketstocks[i].isGolden = false
        }
        for (i = 0; i < marketstocks.length; i++) {
            marketstocks[i].previousprice = marketstocks[i].price
            marketstocks[i].price = randomizeprice(marketstocks[i].price, rng(minpricediff, maxpricediff))
        }
        if (chance(goldenstockchance) == 1) {
            goldenstock = marketstocks[rng(0, marketstocks.length - 1)].id
            marketstocks[findWithAttr(marketstocks, 'id', goldenstock)].isGolden = true;
            marketstocks[findWithAttr(marketstocks, 'id', goldenstock)].price = randomizeprice(marketstocks[findWithAttr(marketstocks, 'id', goldenstock)].price, rng(minpricediff + 200, maxpricediff + 1000))
        }
        redraw();
    }, 1000);
}

// Money operations

function transaction(amount) {
    playermoney = playermoney + amount;
    redraw();
}

function buystock(id, amount) {
    var stockindex = findWithAttr(marketstocks, 'id', id.toUpperCase());
    var stockid = marketstocks[stockindex].id;
    var stockname = marketstocks[stockindex].name;
    var stockprice = marketstocks[stockindex].price;

    if (findWithAttr(ownedstocks, 'id', stockid) == -1) {
        if (amount <= 1000000) {
            ownedstocks.push({
                id: stockid,
                name: stockname,
                price: stockprice,
                amount: amount
            })
            transaction(0 - (stockprice * amount));
            disablepopup();
            console.log(`Added ${amount}x ${stockid} ($${stockprice * amount})`)
        } else {
            swal("Over limit! You cannot buy over 1 000 000 of one stock.", {
                icon: "warning",
            });
            return -1
        }
    } else {
        if (amount <= 1000000) {
            ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount = ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount + amount
            transaction(0 - (stockprice * amount));
            disablepopup();
            console.log(`Added ${amount}x ${stockid} ($${stockprice * amount})`)
        } else {
            swal("Over limit! You cannot buy over 1 000 000 of one stock.", {
                icon: "warning",
            });
            return -1
        }
    }
}

function sellstock(id, amount) {
    var stockindex = findWithAttr(ownedstocks, 'id', id.toUpperCase());
    var stockid = ownedstocks[stockindex].id;
    var stockprice = marketstocks[findWithAttr(marketstocks, 'id', id.toUpperCase())].price;

    if (amount <= ownedstocks[stockindex].amount) {
        if (amount == ownedstocks[stockindex].amount) {
            ownedstocks.splice(stockindex, 1);
        } else {
            ownedstocks[stockindex].amount = ownedstocks[stockindex].amount - amount
        }
        transaction(stockprice * amount);
        disablepopup();
        console.log(`Sold ${amount}x ${stockid} ($${stockprice * amount})`)
    } else {
        swal("Invalid transaction. Please try again.", {
            icon: "warning",
        });
        return -1
    }
}

// end

// Variables

var stockamount = 1;
var stockid = '';
var stockprice = 0;
var action = 0;
var goldenstockchance = 10;
var minpricediff = 1;
var maxpricediff = 500;

function changestockamount(value) {
    if (action == 0) {
        changestockamountonbuy(value);
    } else if (action == 1) {
        changestockamountonsell(value);
    } else return -1
}

function selectallstocks() {
    stockamount = 1;
    if (action == 0) {
        changestockamountonbuy(Math.floor(playermoney / stockprice) - 1);
    } else if (action == 1) {
        changestockamountonsell(ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount - 1);
    } else return -1
}

function changestockamountonbuy(value) {
    if (stockamount + value > 0) {
        /* check if amount is above zero */
        if ((stockamount + value) * stockprice <= playermoney) {
            /* check if player can afford */
            if (ownedstocks[findWithAttr(ownedstocks, 'id', stockid)] !== undefined) {
                if ((stockamount + value + ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount) <= 1000000) {
                    stockamount = stockamount + value;
                } else stockamount = 1000000
            } else {
                if ((stockamount + value) <= 1000000) {
                    stockamount = stockamount + value;
                } else stockamount = 1000000
            }
        }
    } else {
        return -1
    }
}

function changestockamountonsell(value) {
    if (stockamount + value > 0) {
        /* check if amount is above zero */
        if (ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount >= stockamount + value) {
            /* check if player has enough */
            stockamount = stockamount + value;
        }
    } else {
        return -1
    }
}

function marketstockclick(id) {
    stockamount = 1;
    action = 0;
    console.log(`click event invoked on ${id}`);
    stockindex = findWithAttr(marketstocks, 'id', id.toUpperCase());
    stockprice = marketstocks[stockindex].price;
    stockid = marketstocks[stockindex].id;

    $('#popup-amt').text(stockamount);
    $('.popup #action').text('Buy');
    $('.popup #stockname').text(stockid);
    $('.popup #totalprice').text(stockprice * stockamount);
    enablepopup();
    $('.popup #amount-select *').click(function () {
        $('#popup-amt').text(numberspacer(stockamount));
        $('.popup #totalprice').text(numberspacer(stockprice * stockamount));
    })

    $('.popup #buy-btn').attr('onclick', 'buystock(stockid, stockamount);');
}

function inventorystockclick(id) {
    stockamount = 1;
    action = 1;
    console.log(`click event invoked on ${id}`);
    stockindex = findWithAttr(ownedstocks, 'id', id.toUpperCase());
    stockprice = marketstocks[findWithAttr(marketstocks, 'id', id)].price;
    stockid = ownedstocks[stockindex].id;

    $('#popup-amt').text(stockamount);
    $('.popup #action').text('Sell');
    $('.popup #stockname').text(stockid);
    $('.popup #totalprice').text(stockprice * stockamount);
    enablepopup();
    $('.popup #amount-select *').click(function () {
        $('#popup-amt').text(numberspacer(stockamount));
        $('.popup #totalprice').text(numberspacer(stockprice * stockamount));
    })

    $('.popup #buy-btn').attr('onclick', 'sellstock(stockid, stockamount);');
}

function randomizeprice(currentprice, maxdifference) {
    var newprice = currentprice;
    while (newprice == currentprice || newprice <= 0) {
        newprice = rng(currentprice - maxdifference, currentprice + maxdifference);
    }

    return newprice
}

function calculateprofit(id) {
    if (findWithAttr(ownedstocks, 'id', id) !== -1) {
        marketprice = marketstocks[findWithAttr(marketstocks, 'id', id)].price;
        boughtprice = ownedstocks[findWithAttr(ownedstocks, 'id', id)].price;

        if (marketstocks[findWithAttr(marketstocks, 'id', id)].isGolden == true) {
            if (marketprice >= boughtprice) {
                return `<a id="profit-positive" class="profit"><img width="25px" src="./images/profit_golden.png">${numberspacer(-(boughtprice - marketprice))}$</a>`
            } else if (marketprice < boughtprice) {
                return `<a id="profit-negative" class="profit"><img width="25px" src="./images/loss_golden.png">${numberspacer(-(boughtprice - marketprice))}$</a>`
            }
        }
        if (marketprice >= boughtprice) {
            return `<a id="profit-positive" class="profit"><img width="25px" src="./images/profit.png">${numberspacer(-(boughtprice - marketprice))}$</a>`
        } else if (marketprice < boughtprice) {
            return `<a id="profit-negative" class="profit"><img width="25px" src="./images/loss.png">${numberspacer(-(boughtprice - marketprice))}$</a>`
        }
    } else return 'error'
}

function calculatemarketchange(id) {
    if (findWithAttr(marketstocks, 'id', id) !== -1) {
        marketprice = marketstocks[findWithAttr(marketstocks, 'id', id)].price;
        prevprice = marketstocks[findWithAttr(marketstocks, 'id', id)].previousprice;

        if (marketstocks[findWithAttr(marketstocks, 'id', id)].isGolden == true) {
            if (marketprice >= prevprice) {
                return `<img width="25px" src="./images/profit_golden.png">`
            } else if (marketprice < prevprice) {
                return `<img width="25px" src="./images/loss_golden.png">`
            } else if (prevprice == undefined) {
                return `<img width="25px" src="./images/profit_golden.png" style="filter: grayscale(1);">`
            }
        }
        if (marketprice >= prevprice) {
            return `<img width="25px" src="./images/profit.png">`
        } else if (marketprice < prevprice) {
            return `<img width="25px" src="./images/loss.png">`
        } else if (prevprice == undefined) {
            return `<img width="25px" src="./images/profit.png" style="filter: grayscale(1);">`
        }
    } else return 'error'
}

function saveStorageData() {
    arrayToLocalStorage(marketstocks, 'marketstocks');
    arrayToLocalStorage(ownedstocks, 'ownedstocks');
    localStorage.setItem('money', playermoney);
}

function loadStorageData() {
    if (localStorage.getItem('reset') == 'true') {
        saveStorageData();
        localStorage.removeItem('reset');
        nextday();
        swal("Successfully reset player data.", {
            icon: "success",
        });
        return 0
    } else if (localStorage.getItem('money') === null) {
        nextday();
        saveStorageData();
    } else {
        var selectedtheme = 'dark'
        if (localStorage.getItem('theme') !== null) {
            selectedtheme = localStorage.getItem('theme')
        }
        $('#theme').attr('href', `./themes/${selectedtheme}.css`)
        $('#themeselect').val(selectedtheme)
        marketstocks.splice(0, marketstocks.length, ...arrayFromLocalStorage('marketstocks'));
        ownedstocks.splice(0, ownedstocks.length, ...arrayFromLocalStorage('ownedstocks'));
        playermoney = parseInt(localStorage.getItem('money'));
    }
}

function pendReset() {
    swal({
        title: "Reset player data?",
        text: "All the owned stocks, market stocks prices, player money and custom stocks will be reset!",
        icon: "warning",
        buttons: true,
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            localStorage.setItem('reset', 'true');
            location.reload();
        }
    });
}

let tips = [
    'Press on stock to open buy/sell menu!',
    'Press "Next day" to make prices change!',
    'Press on "Max" button when selecting purchase amount to set the amount to max you can afford!',
    'Earn money by selling stocks for more money than you bought them for!',
    'A stock has a small chance of becoming golden, changing the price drastically.',
    'Invest in different stocks, one of them can become golden!',
]

// end

// Player data
var playermoney = 1000;

let marketstocks = [{
        id: "TSLA",
        name: "Tesla, Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "AAPL",
        name: "Apple Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "AMD",
        name: "Advanced Micro Devices, Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "AMZN",
        name: "Amazon.com, Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "MSFT",
        name: "Microsoft Corporation",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "FB",
        name: "Facebook, Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "ADBE",
        name: "Adobe, Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "INTC",
        name: "Intel Corporation",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "NVDA",
        name: "Nvidia",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
    {
        id: "PYPL",
        name: "PayPal Holdings, Inc.",
        price: 10,
        previousprice: 10,
        isGolden: false
    },
]

let ownedstocks = []
// end

function secretcode() {
    "use strict";
    var up = 38,
        down = 40,
        left = 37,
        right = 39,
        A = 65,
        B = 66;
    var secretCode = [up, up, down, down, left, right, left, right, B, A];
    var secretDetected = [];

    function attachCustomEvent(el, eventName, desiredFunction) {
        if (el.addEventListener) {
            el.addEventListener(eventName, desiredFunction, false);
        } else {
            el.attachEvent('on' + eventName, desiredFunction);
        }
    }

    function detachCustomEvent(el, eventName, desiredFunction) {
        if (el.removeEventListener) {
            el.removeEventListener(eventName, desiredFunction, false);
        } else {
            el.detachEvent('on' + eventName, desiredFunction);
        }
    }

    function startUpsecret() {
        detachCustomEvent(document, "keydown", issecretKey);
        secretIsDetected();
    }

    function issecretKey(e) {
        var evt = e || window.event;
        var key = evt.keyCode ? evt.keyCode : evt.which;
        var codeOk = true;
        secretDetected.push(key);
        if (secretDetected.length < secretCode.length) {
            for (var i = 0, max = secretDetected.length; i < max; i++) {
                if (secretDetected[i] !== secretCode[i]) {
                    codeOk = false;
                }
            }
            if (!codeOk) {
                secretDetected = [];
                secretDetected.push(key);
            }
        } else if (secretDetected.length === secretCode.length) {
            for (var j = 0, max = secretDetected.length; j < max; j++) {
                if (secretDetected[j] !== secretCode[j]) {
                    codeOk = false;
                }
            }
            secretDetected = [];
            if (codeOk) {
                startUpsecret();
            }
        } else {
            secretDetected = [];
        }
    }
    attachCustomEvent(document, "keydown", issecretKey);
};

function secretIsDetected() {
    transaction(parseInt(prompt('Code detected! Enter the amount of money you want: \nNOTE: You can only use this once!')));
}

function cheatcode() {
    var cheatCode = 0;
    swal("Enter cheat code:", {
        content: "input",
    }).then((value) => {
        cheatCode = value.toUpperCase();
        console.log(`Entered cheat code "${cheatCode}".`)
        if (cheatCode == 'GIVEMEMONEY') {
            swal("Enter the amount of money you want:", {
                content: "input",
            }).then((value) => {
                transaction(parseInt(value));
                swal('Code activated!', {
                    icon: 'success'
                })
            });
        } else if (cheatCode == 'MARKETCRASH') {
            swal("Enter the mimimal stock price difference:", {
                content: "input",
            }).then((value) => {
                minpricediff = parseInt(value);
                swal("Enter the maximal stock price difference:", {
                    content: "input",
                }).then((value) => {
                    maxpricediff = parseInt(value);
                    swal('Code activated!', {
                        icon: 'success'
                    })
                });
            });
        } else if (cheatCode == 'NEWSTOCK') {
            var newid = 0;
            var newname = 0;
            var newprice = 0;

            swal("Enter the new stock ID:", {
                content: "input",
            }).then((value) => {
                newid = value.toUpperCase();
                swal("Enter the new stock name:", {
                    content: "input",
                }).then((value) => {
                    newname = value;
                    swal("Enter the new stock price:", {
                        content: "input",
                    }).then((value) => {
                        newprice = parseInt(value);
                        marketstocks.push({
                            id: newid,
                            name: newname,
                            price: newprice
                        });
                        redraw();
                        swal('Code activated!', {
                            icon: 'success'
                        })
                    });
                });
            });
        } else if (cheatCode == 'DELSTOCK') {
            swal("Enter the ID of stock you want to remove:", {
                content: "input",
            }).then((value) => {
                var oldid = value.toUpperCase();
                if (findWithAttr(marketstocks, 'id', oldid) > -1) {
                    marketstocks.splice(findWithAttr(marketstocks, 'id', oldid), 1)
                }
                redraw();
                swal('Code activated!', {
                    icon: 'success'
                })
            });
        } else if (cheatCode == 'GOLDENCOIN') {
            swal("Enter the chance of stock becoming golden:", {
                content: "input",
            }).then((value) => {
                if (parseInt(value) <= 100) {
                    goldenstockchance = parseInt(value);
                } else
                    swal('Code activated!', {
                        icon: 'success'
                    })
            });
        } else swal('Incorrect/empty code!')
    });
}

function changeTheme(selected) {
    loadScr(true, true);
    localStorage.setItem('theme', selected.value);
    setTimeout(function () {
        $('#theme').attr('href', `./themes/${selected.value}.css`)
    }, 1000);
}

$(document).ready(function () {
    loadStorageData();
    redraw();
    $('#popupouter').hide();
    secretcode();
});