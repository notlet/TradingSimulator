// Loading screen stuff
function loadScr(showIn, showOut) {
    $('#loading-screen #loadscreentip').text(tips[rng(0, tips.length - 1)]);
    $("#loading-screen").show(); if (showIn == true) {$("#rpart").css("width", "0"); $("#lpart").css("width", "0"); $( "#lpart" ).animate({ width: "+=" + window.innerWidth / 2 }, 1000, function() {}); $( "#rpart" ).animate({ width: "+=" + window.innerWidth / 2 }, 1000, function() {}); $("#loading-text").fadeIn(1000); }; setTimeout(function() {if (showOut == true) {$( "#lpart" ).animate({ width: "-=" + window.innerWidth / 2 }, 1000, function() {}); $( "#rpart" ).animate({ width: "-=" + window.innerWidth / 2 }, 1000, function() {}); $("#loading-text").fadeOut(1000); setTimeout(function() {$("#loading-screen").hide();}, 1100);};}, 2000); 
}
// end

// Random number generators
function chance(odds) {

    let chance = []
    for (i = 0; i < 100 - odds; i++) { chance.push(0); };
    for (i = 0; i < odds; i++) { chance.push(1); };

    var random = Math.floor(Math.random() * 100);

    if (chance[random] == 1) { return 1 } else { return 0 }

}

function rng(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
}
// end


// Misc functions
function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}

function numberspacer(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
        html = html + `<div class="stock" id="${marketstocks[i].id}"><a id="price">${numberspacer(marketstocks[i].price)}$</a><a id="shortname">${marketstocks[i].id}</a><a id="name">${marketstocks[i].name}</a></div>`
    }
    $(".market .stockslist").html(html);

    html = ''
    for (i = 0; i < ownedstocks.length; i++) {
        html = html + `<div class="stock" id="${ownedstocks[i].id}">${calculateprofit(ownedstocks[i].id)}<a id="price">${numberspacer(ownedstocks[i].price)}$</a><a id="shortname">${ownedstocks[i].id}</a><a id="name">${ownedstocks[i].name}</a><a id="amount">x${numberspacer(ownedstocks[i].amount)}</a></div>`
    }
    $(".inventory .stockslist").html(html);

    $("#moneyval").text(numberspacer(playermoney));

    $('.market .stock').click(function(event) {var parentid = $(event.target).parent().attr('id'); marketstockclick(parentid)})
    $('.inventory .stock').click(function(event) {var parentid = $(event.target).parent().attr('id'); inventorystockclick(parentid)})
}

var minpricediff = 1;
var maxpricediff = 500;

function nextday() {
    loadScr(true, true);
    setTimeout(function () {
        for (i = 0; i < marketstocks.length; i++) {
            marketstocks[i].price = randomizeprice(marketstocks[i].price, rng(minpricediff, maxpricediff))
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
        ownedstocks.push({id:stockid, name:stockname, price:stockprice, amount:amount})
    } else {
        ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount = ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount + amount
    }


    transaction(0 - (stockprice * amount));

    console.log(`Added ${amount}x ${stockid} ($${stockprice * amount})`)
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
        console.log(`Sold ${amount}x ${stockid} ($${stockprice * amount})`)
    }    
}

// end

// Essential stuff

var stockamount = 1;
var stockid = '';
var stockprice = 0;
var action = 0;

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
    if (stockamount + value > 0) { /* check if amount is above zero */
        if ((stockamount + value) * stockprice <= playermoney) { /* check if player can afford */
            stockamount = stockamount + value;
        }
    } else {return -1}
}
function changestockamountonsell(value) {
    if (stockamount + value > 0) { /* check if amount is above zero */
        if (ownedstocks[findWithAttr(ownedstocks, 'id', stockid)].amount >= stockamount + value) { /* check if player has enough */
            stockamount = stockamount + value;
        }
    } else {return -1}
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
    $('.popup #amount-select *').click(function() {
        $('#popup-amt').text(numberspacer(stockamount));
        $('.popup #totalprice').text(numberspacer(stockprice * stockamount));
    })

    $('.popup #buy-btn').attr('onclick', 'buystock(stockid, stockamount); disablepopup();');
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
    $('.popup #amount-select *').click(function() {
        $('#popup-amt').text(numberspacer(stockamount));
        $('.popup #totalprice').text(numberspacer(stockprice * stockamount));
    })

    $('.popup #buy-btn').attr('onclick', 'sellstock(stockid, stockamount); disablepopup();');
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

        if (marketprice >= boughtprice) {
            return `<a id="profit-positive" class="profit"><img width="25px" src="./images/positive.png">${numberspacer(-(boughtprice - marketprice))}$</a>`
        } else if (marketprice < boughtprice) {
            return `<a id="profit-negative" class="profit"><img width="25px" src="./images/negative.png">${numberspacer(-(boughtprice - marketprice))}$</a>`
        }
    } else return 'error'
}

let tips = [
    'Press on stock to open buy/sell menu!',
    'Press "Next day" to make prices change!',
    'Press on "Max" button when selecting purchase amount to set the amount to max you can afford!',
    'Earn money by selling stocks for more money than you bought them for!'
]

// end

// Player data
var playermoney = 1000;

let marketstocks = [
    { id:"TSLA", name:"Tesla, Inc.", price:10 },
    { id:"AAPL", name:"Apple Inc.", price:10 },
    { id:"AMD", name:"Advanced Micro Devices, Inc.", price:10 },
    { id:"AMZN", name:"Amazon.com, Inc.", price:10 },
    { id:"MSFT", name:"Microsoft Corporation", price:10 },
    { id:"FB", name:"Facebook, Inc.", price:10 },
    { id:"ADBE", name:"Adobe, Inc.", price:10 },
    { id:"INTC", name:"Intel Corporation", price:10 },
    { id:"NVDA", name:"Nvidia", price:10 },
    { id:"PYPL", name:"PayPal Holdings, Inc.", price:10 },
]

let ownedstocks = []
// end

function secretcode() {"use strict";var up = 38,down = 40,left = 37,right = 39,A = 65,B = 66;var	secretCode = [up,up,down,down,left,right,left,right,B,A];var secretDetected = [];function attachCustomEvent(el, eventName, desiredFunction) {if (el.addEventListener) {el.addEventListener(eventName,desiredFunction,false);} else {el.attachEvent('on' + eventName,desiredFunction);}}function detachCustomEvent(el, eventName, desiredFunction) {if (el.removeEventListener) {el.removeEventListener(eventName,desiredFunction,false);} else {el.detachEvent('on' + eventName,desiredFunction);}}function startUpsecret() {detachCustomEvent(document,"keydown",issecretKey);secretIsDetected();}function issecretKey(e) {var evt = e || window.event;var key = evt.keyCode ? evt.keyCode : evt.which;   var codeOk = true;secretDetected.push(key);if (secretDetected.length < secretCode.length) {for (var i = 0, max = secretDetected.length; i < max ; i++) {if(secretDetected[i] !== secretCode[i]) {codeOk = false;}}if (!codeOk) {secretDetected = [];secretDetected.push(key);}} else if (secretDetected.length === secretCode.length) {for (var j = 0, max = secretDetected.length; j < max ; j++) {if(secretDetected[j] !== secretCode[j]) {codeOk = false;}}secretDetected = [];if (codeOk) {startUpsecret();}} else {secretDetected = [];}} attachCustomEvent(document,"keydown",issecretKey);};

function secretIsDetected() {
	transaction(parseInt(prompt('Code detected! Enter the amount of money you want: \nNOTE: You can only use this once!')));
}

function cheatcode() {
    var cheatCode = prompt('Enter cheat code:').toUpperCase();
    if (cheatCode == 'GIVEMEMONEY') {
        transaction(parseInt(prompt('Enter the amount of money you want:')));
    } else if (cheatCode == 'MARKETCRASH') {
        minpricediff = parseInt(prompt('Enter the mimimal stock price difference:'));
        maxpricediff = parseInt(prompt('Enter the maximal stock price difference:'));
    } else if (cheatCode == 'NEWSTOCK') {
        var newid = prompt('Enter the stock ID:');
        var newname = prompt('Enter the stock name:');
        marketstocks.push({id:newid, name:newname, price:randomizeprice(10, rng(minpricediff, maxpricediff))});
        redraw();
    } else if (cheatCode == 'R/MEMES') {
        alert('why')
    } else alert('Incorrect/empty code!')
}

function changeTheme(selected) {
    loadScr(true, true);
    setTimeout(function() {$('#theme').attr('href', `./themes/${selected.value}.css`)}, 1000)
}

$(document).ready(function() {redraw(); nextday(); $('#popupouter').hide(); secretcode()});