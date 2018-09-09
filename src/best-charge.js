const loadAllItems = require("./items")
const loadPromotions = require("./promotions")

function getSelectItemsMessage(selectedItems) {
  return selectedItems.map(selectedItem => {
    const id = selectedItem.substring(0, selectedItem.indexOf("x")).trim();
    const number = selectedItem.substring(selectedItem.indexOf("x") + 1).trim();
    const item = getItemById(id);
    return {
      id: id, name: item.name, number: number,
      price: item.price * number,
    }
  });
}

function outSelectItemMessage(selectedGoods){
  return selectedGoods.reduce((acc, cur) => acc + `${cur.name} x ${cur.number} = ${cur.price}元\n`, "");
}

function compareBestDiscount(selectedGoods){
  let count = selectedGoods.reduce((acc, cur) => acc + cur.price, 0);

  let overDiscount = payByOver(count);

  let halfDiscount = payByHalf(selectedGoods,count);

  if(overDiscount.discount>0||halfDiscount.discount>0){
    return halfDiscount.discount > overDiscount.discount ? halfDiscount : overDiscount;
  }

  else{
    return  {"type": null, "discount": 0, "count": count};
  }
}

function payByOver(count) {
  let discount = count>30? 6:0;

  return {"type": "满30减6元", "discount": discount, "count": count-discount};
}

function payByHalf(selectedGoods,count) {
  let discount = 0;

  let type = "指定菜品半价";

  loadPromotions().forEach(function (promotion) {
    if (promotion.type === "指定菜品半价") {
      let discountItems = selectedGoods.filter(item => promotion.items.includes(item.id))
      discount = discountItems.reduce((acc, cur) => acc + cur.price / 2, 0);
      type += "(" + discountItems.map(item => item.name).join("，") + ")";
    }
  });

  return {"type": type, "discount": discount, "count": count-discount}
}

function outDiscountMessage(discountDetails){
  const spliter = `-----------------------------------\n`;
  return discountDetails.type ? `使用优惠:\n${discountDetails.type}，省${discountDetails.discount}元\n${spliter}` : "";
}



function getItemById(id) {
  return loadAllItems().filter(item => item.id === id)[0];
}


function coutBill(selectedGoods,discountDetails){
  let bill = `============= 订餐明细 =============\n`;

  bill += outSelectItemMessage(selectedGoods);
  bill += "-----------------------------------\n";
  bill += outDiscountMessage(discountDetails);
  bill += `总计：${discountDetails.count}元\n`;
  bill +=`===================================`;

  return bill;
}

function bestCharge(selectedItems) {
  var selectedGoods = getSelectItemsMessage(selectedItems);

  var discountDetails = compareBestDiscount(selectedGoods);

  return coutBill(selectedGoods,discountDetails);
}

module.exports = bestCharge;
