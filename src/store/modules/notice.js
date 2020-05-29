const notice = {
  state: {
    home_notice_url: process.env.HOME_URL + "/#/notice",
    home_noticedetails_url: process.env.HOME_URL + "/#/noticeDetails",
    notice_number: 0
  },
  mutations: {
    SET_NOTICE: (state, number) => {
      state.notice_number = number
    }
  },
  actions: {}
}

export default notice
