'use strict';


document.addEventListener('DOMContentLoaded', function () {


  // Только страница редактирования заказа
  if (!window.location.pathname.includes('/Admin/Order/Edit'))
    return;


  const form = document.querySelector('#order-form');

  if (!form)
    return;


  const orderProducts =
    form.querySelector('#order-products');


  if (!orderProducts)
    return;


  const header =
    form.querySelector('.content-header .pull-right');


  if (!header)
    return;



  function getOrderId() {
    const match =
      window.location.pathname.match(/Edit\/(\d+)/i);

    return match ? match[1] : null;
  }



  function getProductList() {

    const result = [];


    const rows =
      orderProducts.querySelectorAll('table tbody tr');


    rows.forEach(row => {


      const cells =
        row.querySelectorAll('td');


      if (cells.length < 6)
        return;



      const title =
        cells[1]
          .querySelector('em')
          ?.innerText
        ||
        '';



      let additional = '';

      cells[1]
        .querySelectorAll('p')
        .forEach(p => {

          additional +=
            p.innerText + '<br>';

        });



      result.push({

        image:
          cells[0].innerHTML,


        title: title,


        additional:
          additional,


        pricePerUnit:
          cells[2].innerText.trim(),


        quantity:
          cells[3].innerText.trim(),


        totalPrice:
          cells[5].innerText.trim()

      });


    });


    return result;

  }




  function createButton() {

    const btn =
      document.createElement('span');


    btn.className =
      'btn bg-light-blue';


    btn.innerHTML =
      '<i class="fa fa-file-pdf-o"></i> Печать';



    btn.addEventListener(
      'click',
      printOrder
    );


    header.prepend(btn);

  }





  function printOrder() {

    const products =
      getProductList();



    console.log(products);



    sessionStorage.setItem(
      'print-products',
      JSON.stringify(products)
    );



    const id =
      getOrderId();



    if (!id) {
      alert('Не найден ID заказа');
      return;
    }



    window.open(
      '/Admin/OrderPrint/Print/' + id,
      'print',
      'width=900,height=700'
    );


  }




  createButton();


});