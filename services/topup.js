const { user_cookie } = require('../models');
class Topup {
  constructor() {
    this.cookie_model = user_cookie;
  }

  async getCookie (id) {
    try {
      const userLogin = await this.cookie_model.findOne({
        where: {
          id
        }
      })
      if (userLogin && userLogin.cookie_json) {
        return userLogin.cookie_json;
      } else {
        const e = new Error();
        e.type = 'NEED_LOGIN';
        e.message = 'YOU NEED TO LOGIN FIRST';
        throw e;
      }
    } catch (e) {
      console.error('error in topup function')
      console.error(e);
      throw e;
    }
    
  }
}
