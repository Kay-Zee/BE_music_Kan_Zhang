

var testScript = {
  listen: function() {
    $.ajax({
      url: 'http://localhost:3000/listen',
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  }
};

describe('Fictional MVP', function() {
  describe('#Listen', function() {
    testScript.listen();
  });
});