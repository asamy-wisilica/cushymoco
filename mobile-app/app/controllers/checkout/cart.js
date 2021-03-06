var cartModel = Alloy.createModel('cart');
var tableData = [];
var shoppingCartView = $.shoppingCart;
var emptyCartHintView = $.emptyCartHint;
var nextStepButton;

function onProductDelete(e)
{
    cartModel.products.at(e.rowIndex).destroy({
        success:function(response) {
            if (response.success) {
                $.cartProducts.deleteRow(e.rowIndex, {animated: true});
                $.totalProducts.text = response.totalProducts + ' ' + response.currency;
                if (response.shipping == false) {
                	$.shippingCosts.text = '';
                } else {
                	$.shippingCosts.text = response.shipping + ' ' + response.currency;
                }
                $.totalCosts.text = response.total + ' ' + response.currency;
                
                if (cartModel.products.length == 0) {
                    $.baseWin.remove(shoppingCartView);
                    $.baseWin.add(emptyCartHintView);
                    $.baseWin.rightNavButton = null;
                }
            } else {
                cartModel.fetch();
            }
        }
    });
}

function onProductUpdate(e)
{
    var cartProduct = cartModel.products.where({productId:e.productId})[0];
    cartProduct.set({amount:e.quantity}, {
        success:function(response) {
            Ti.API.warn(response);
            if (e.success) {
                e.success(response);
            }
            
            $.totalProducts.text = response.totalProducts + ' ' + response.currency;
                if (response.shipping == false) {
                	$.shippingCosts.text = '';
                } else {
                	$.shippingCosts.text = response.shipping + ' ' + response.currency;
                }
            $.totalCosts.text = response.total + ' ' + response.currency;
        }
    });
}

function onProductDetails(e)
{
    var navWin = Alloy.createController("product/details", {"productId":e.productId}).getView();
    $.cartNavigation.open(navWin);
    navWin.addEventListener('close', function(e) {
        Ti.API.warn(e);
    });
}

function updateCart()
{
    cartModel.products.map(function(cartProduct) {
        var row = Alloy.createController('checkout/cartProductRow', {
            'productId': cartProduct.get('productId'),
            'icon': cartProduct.get('icon'),
            'price': cartProduct.get('total') + ' ' + cartProduct.get('currency'),
            'title': cartProduct.get('title'),
            'amount': cartProduct.get('amount'),
            'shortDesc': cartProduct.get('shortDesc')
        }).getView();
        tableData.push(row);
    });
    $.cartProducts.setData(tableData);
    
    var currency = cartModel.get('currency');
    $.totalProducts.text = cartModel.get('totalProducts') + ' ' + currency;
    var shipping = cartModel.get('shipping');
    if (shipping == false) {
    	$.shippingCosts.text = '';
    } else {
    	$.shippingCosts.text = cartModel.get('shipping') + ' ' + currency;
    }
    $.totalCosts.text = cartModel.get('total') + ' ' + currency;
}

cartModel.on('change', function() {
    if (Alloy.Globals.cartItemCount > 0) {
        $.baseWin.remove(emptyCartHintView);
        $.baseWin.rightNavButton = nextStepButton;
        updateCart();
        return;
    }
    
    $.baseWin.rightNavButton = null;
    
    $.baseWin.remove(shoppingCartView);
});

nextStepButton = Ti.UI.createButton({
    title:'Weiter >'
});

nextStepButton.addEventListener('click', function(e) {
    var userDataWin = Alloy.createController('checkout/userData', {nav:$.cartNavigation}).getView();
    $.cartNavigation.open(userDataWin);
});

cartModel.fetch();

$.cartProducts.addEventListener('cart.product:delete', onProductDelete);
$.cartProducts.addEventListener('cart.product:update', onProductUpdate);
$.cartProducts.addEventListener('cart.product:details', onProductDetails);

