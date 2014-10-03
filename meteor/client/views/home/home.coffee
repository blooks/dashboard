Template.home.rendered = ->

  #SEO Page Title & Description
  document.title = "Coyno"
  $("<meta>", { name: "description", content: "This is Coyno." }).appendTo "head"
