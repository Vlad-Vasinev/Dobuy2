const jsonServer = require("json-server");
const cors = require("cors");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const rawdata = require("./cart.json");
// const rawdata = require("./cart-empty.json");


const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

server.use(jsonServer.bodyParser);
var cart = deepCopy(rawdata);

const plainItem = {
  id: "0004",
  amount: "1",
  title: "Смартфон Samsung Galaxy S23 Ultra 12/256 Гб, зеленый",
  price: {
    value: "119 999 ₽",
    discount: {
      old: "135 000 ₽",
      sale: "-15%",
    },
  },
  images: ["img/product/4/img0.png"],
};

server.use(middlewares);
server.use(cors());

server.post("/cart", (req, res) => {
  const item = req.body?.product;
  const action = req.body?.action;

  let errMsg = "что-то пошло не так";
  if (item && action) {
    if (action == "addItemToCart") {
      console.log("itemToCart");
      cart.items.push({ ...plainItem, id: item.id || '0004' });
      res.status(200);
      res.json(cart);
      return;
    }
    if (action == "deleteAllItems") {
      // cart.items = [];
      // cart.orderCost.sales = [];
      // cart.orderCost.finalTotal = "0 Р";
      // cart.orderCost.clearTotal = "0 Р";
      res.status(200);
      res.json(cart);
      return;
    }

    const tartgetI = cart.items.findIndex((i) => i.id == item.id);
    if (tartgetI != -1) {
      switch (action) {
        case "changeItemAmount": {
          cart.items[tartgetI].amount = item.amount;
          const newVal =
            cart.items[tartgetI].price.value.replace(/\D/g, "") * +item.amount +
            "₽";

          cart.items[tartgetI].price.value = newVal;
          const newOld =
            cart.items[tartgetI].price.discount.old.replace(/\D/g, "") *
            +item.amount +
            "₽";
          cart.items[tartgetI].price.discount.old = newOld;
          cart.orderCost.finalTotal += 1
          res.status(200);
          res.json(cart);
          break;
        }
        case "deleteItem": {
          cart.items.splice(tartgetI, 1);

          res.status(200);
          res.json(cart);
          break;
        }
        default:
          errMsg = "неизвестная команда";
          break;
      }

      return;
    } else {
      errMsg = "не могу найти в корзине " + item.id;
    }
  }
  console.log(item, action);
  res.status(500);
  res.json({
    errMsg: errMsg,
  });
});

server.get("/cart", (req, res) => {
  res.status(200);
  res.json(cart);
});
server.post("/register", (req, res) => {
  res.status(200);
  res.json({
    success: false,
    "message": "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0441 \u043b\u043e\u0433\u0438\u043d\u043e\u043c \"7xxxxxxxx\" \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442.<br>"
  });
});

server.post("/auth", (req, res) => {

  console.log(req.body);
  res.status(200);
  res.json({
    success: true,
    codeSended: "true",
    timeout: "70",
    message: 'Пользователь не найден'
  });
});
server.post("/code", (req, res) => {
  res.status(200);
  res.json({
    success: false,
  });
  return
  // console.log(JSON.stringify(req));
  // if (req.body?.code == "0000") {
  //   res.status(200);
  //   res.json({
  //     success: true,
  //   });
  //   return
  // }
  // res.status(500);
  // res.json({
  //   success: false,
  // });
});
server.post('/test', (req, res) => {
  res.status(200);
  console.log('test post success');
  res.send()
})

server.post("/order", (req, res) => {
  res.status(200);
  // Устаревший вариант
  // res.json({
  //   success: true,
  //   order: {
  //     REDIRECT_URL: '/order-payment.html',
  //     ID: "1312",
  //   }
  // });
  res.redirect("http://localhost:3000/order-payment.html")
  return

  // res.status(500);
  // res.json({
  //   success: false,
  // });
});

server.post("/promocode", (req, res) => {



  if (req.body.code == "0000") {
    // == если провал  
    res.status(500);
    const obj = {
      ...deepCopy(cart),
      errMsg: 'Промокод больше недействителен',
      promocode: undefined,
    }
    obj.orderCost.sales[1] = undefined
    res.json(obj);
    return
  }
  if (req.body.code == "") {
    // == если провал  
    res.status(200);
    const obj = {
      ...deepCopy(rawdata),
    }

    res.json(obj);
    return
  }
  // == если успешно применён 
  cart.promocode = { code: req.body.code }
  cart.orderCost.sales[1] = {
    "name": req.body.code,
    "value": "-1 500 ₽"
  }
  cart.orderCost.finalTotal = "26 500 ₽"
  res.status(200);
  res.json(cart);
  return
});
server.post("/favs", (req, res) => {
  // добавление и удаление 
  // action = add | delete
  res.status(200);
  res.send()
  return
});

server.post("/user-data", (req, res) => {
  res.status(200);
  res.send()
  return
})

server.post("/user-address", (req, res) => {
  res.status(200);
  // action = add | patch | delete
  res.json({ id: "0001" })
  return
})

//

server.use(router);
server.listen(8080, () => {
  console.log("JSON Server is running");
});
// In this example we simulate a server side error response
