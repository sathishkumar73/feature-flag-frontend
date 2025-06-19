// Manual mock for supabaseClient
module.exports = {
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
};
