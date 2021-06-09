const url = 'https://vue3-course-api.hexschool.io';
const path = 'youting';
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});
const app = Vue.createApp({
  data() {
    return {
      loadingStatus: {
        isLoading: '',
      },
      products: [],
      product: {},
      cart: {},
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
    };
  },
  methods: {
    getProducts() {
      axios
        .get(`${url}/api/${path}/products`)
        .then((res) => {
          if (res.data.success) {
            this.products = res.data.products;
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getProduct(id) {
      this.loadingStatus.isLoading = id;
      axios
        .get(`${url}/api/${path}/product/${id}`)
        .then((res) => {
          if (res.data.success) {
            this.product = res.data.product;
            this.loadingStatus.isLoading = '';
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getCart() {
      axios
        .get(`${url}/api/${path}/cart`)
        .then((res) => {
          if (res.data.success) {
            this.cart = res.data.data;
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    addCart(item, qty = 1) {
      this.loadingStatus.isLoading = item.id;
      const cart = { product_id: item.id, qty };
      axios
        .post(`${url}/api/${path}/cart`, { data: cart })
        .then((res) => {
          if (res.data.success) {
            this.getCart();
            this.loadingStatus.isLoading = '';
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    updateCart(id, qty) {
      console.log(id, qty);
      this.loadingStatus.isLoading = id;
      const cart = { product_id: id, qty: qty };
      axios
        .put(`${url}/api/${path}/cart/${id}`, { data: cart })
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            this.getCart();
            this.loadingStatus.isLoading = '';
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    removeCarts(id) {
      this.loadingStatus.isLoading = id;
      axios
        .delete(`${url}/api/${path}/cart/${id}`)
        .then((res) => {
          if (res.data.success) {
            this.loadingStatus.isLoading = '';
            this.getCart();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    removeAllCarts() {
      axios
        .delete(`${url}/api/${path}/carts`)
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            this.getCart();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    createOrder() {
      console.log('送出訂單');
      axios
        .post(`${url}/api/${path}/order`, { data: this.form })
        .then((res) => {
          if (res.data.success) {
            console.log(res);
            alert(res.data.message);
            this.$refs.form.resetForm();
            this.getCart();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});
app
  .component('cart', {
    props: ['userCart', 'icon'],
    emits: ['remove-cart', 'remove-all', 'edit-cart'],
    template: `
    <h2 class="text-center">購物車</h2>
    <table class="table" v-if="userCart.total">
          <thead>
            <tr>
              <th>品項</th>
              <th></th>
              <th>單價</th>
              <th>數量</th>
              <th>金額</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="js-cartItem">
            <tr v-for="item in userCart.carts" :key="item.id">
            <td>
                <p>{{ item.product.title }}</p>
            </td>
            <td><img :src="item.product.imageUrl" alt="product" width="120" height="100"></td>
            <td>NT$ {{ item.product.price }}</td>
            <td>
              <a href="#" class="btn btn-danger btn-sm" :class="{'disabled':item.qty===1 ||icon.isLoading===item.id}" @click.prevent="editCart(item.id,item.qty-1)">-</a> 
              {{item.qty}} 
              <a href="#" class="btn btn-danger btn-sm" :class="{'disabled' : icon.isLoading === item.id}" @click.prevent="editCart(item.id,item.qty+1)">+</a> 
            </td>
            <td>NT$ {{ item.total }}</td>
            <td class="discardBtn">
              <a href="#" class="btn btn-danger" :class="{'disabled' : icon.isLoading === item.id}" @click.prevent="removeCartItem(item.id)">
              <div
                class="spinner-border spinner-border-sm"
                role="status"
                v-if="icon.isLoading === item.id"
              >
                <span class="visually-hidden"></span>
              </div>刪除
              </a>
            </td>
          </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <a href="#" class="btn btn-outline-danger" @click.prevent="$emit('remove-all')">刪除所有品項</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <p>總金額</p>
              </td>
              <td class="text-info fw-bold">NT$ {{ userCart.final_total }}</td>
            </tr>
          </tfoot>
        </table>`,
    methods: {
      removeCartItem(id) {
        this.$emit('remove-cart', id);
      },
      editCart(id, qty) {
        this.$emit('edit-cart', id, qty);
      },
    },
  })
  .component('VForm', VeeValidate.Form)
  .component('VField', VeeValidate.Field)
  .component('ErrorMessage', VeeValidate.ErrorMessage)
  .mount('#app');
