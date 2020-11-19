import { loadAllItems, loadPromotions } from './Dependencies'

export function printReceipt(tags: string[]): string {
  const allItems: object[] = loadAllItems()
  const promotionBarcodes: string[] = loadPromotions()[0].barcodes
  const items = identifyBarcodes(tags, allItems)
  const itemsAfterPromotion = checkPromotion(items, promotionBarcodes)
  const subtotals = calculatePrice(itemsAfterPromotion)
  return render(subtotals, items)
}

class Item {
  barcode: string
  name: string
  quantity: number
  unit: string
  price: number
  discounted: number
  constructor(barcode: string, name: string, quantity: number, unit: string, price: number) {
    this.barcode = barcode
    this.name = name
    this.quantity = quantity
    this.unit = unit
    this.price = price
    this.discounted = 0
  }
}

function identifyBarcodes(barcodes: string[], allItems: any[]): Item[] {
  const items: Item[] = []
  for (let i = 0; i < barcodes.length; i++) {
    let isInItems = false
    let quantity = 1
    if (barcodes[i].length !== 10) {
      quantity = Number(barcodes[i].substring(11))
    }
    for (let k = 0; k < items.length; k++) {
      if (items[k].barcode === barcodes[i].substring(0, 10)) {
        isInItems = true
        items[k].quantity += quantity
      }
    }
    if (!isInItems) {
      for (let m = 0; m < allItems.length; m++) {
        if (allItems[m].barcode === barcodes[i].substring(0, 10)) {
          items.push(new Item(allItems[m].barcode, allItems[m].name, quantity, allItems[m].unit, allItems[m].price))
        }
      }
    }
  }
  return items
}

function checkPromotion(items: Item[], promotionBarcodes: string[]): Item[] {
  items.map(item => {
    promotionBarcodes.map(
      promotionBarcode => (promotionBarcode === item.barcode) ? item.discounted = Math.floor(item.quantity / 3) * item.price : null)
  })
  return items
}

function calculatePrice(itemsAfterPromotion: Item[]): number[] {
  const subtotalArr: number[] = []
  itemsAfterPromotion.map(item => subtotalArr.push(item.price * item.quantity - item.discounted))
  return subtotalArr
}

function render(subtotalArr: number[], items: Item[]): string {
  let firstPart = '***<store earning no money>Receipt ***\n'
  let discounted = 0
  for (let i = 0; i < items.length; i++) {
    firstPart += 'Name：' + items[i].name + '，Quantity：' + items[i].quantity + ' '
      + (items[i].unit) + 's，Unit：' + items[i].price.toFixed(2) + '(yuan)，Subtotal：'
      + subtotalArr[i].toFixed(2) + '(yuan)\n'
    discounted += items[i].discounted
  }
  let totalPrice = 0
  subtotalArr.map(subtotal => totalPrice += subtotal)
  let secondPart = '----------------------\nTotal：'
  secondPart += totalPrice.toFixed(2) + '(yuan)\nDiscounted prices：' + discounted.toFixed(2) + '(yuan)\n**********************'
  return firstPart + secondPart
}

// return `***<store earning no money>Receipt ***
// Name：Sprite，Quantity：5 bottles，Unit：3.00(yuan)，Subtotal：12.00(yuan)
// Name：Litchi，Quantity：2.5 pounds，Unit：15.00(yuan)，Subtotal：37.50(yuan)
// Name：Instant Noodles，Quantity：3 bags，Unit：4.50(yuan)，Subtotal：9.00(yuan)
// ----------------------
// Total：58.50(yuan)
// Discounted prices：7.50(yuan)
// **********************`
