using System.Web;
using System.Web.Optimization;

namespace SMIS
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/adminlte/jquery_script").Include(
            // jQuery
            "~/plugins/jquery/jquery.min.js"));

            bundles.Add(new ScriptBundle("~/adminlte/jquery").Include(
                        // Bootstrap 4
                        "~/plugins/bootstrap/js/bootstrap.bundle.min.js",
                        // Select2
                        "~/plugins/select2/js/select2.full.min.js",
                        // SweetAlert2
                        "~/plugins/sweetalert2/sweetalert2.min.js",
                        // Toastr
                        "~/plugins/toastr/toastr.min.js",
                        "~/plugins/daterangepicker/daterangepicker.js",
                        // Moment
                        "~/plugins/moment/moment.min.js",
                        // InputMask
                        "~/plugins/inputmask/min/jquery.inputmask.bundle.min.js",
                        // Date Range Picker
                        "~/plugins/daterangepicker/daterangepicker.js",
                        // ChartJS
                        "~/plugins/chart.js/Chart.min.js",
                        // DataTables
                        "~/plugins/datatables/jquery.dataTables.js",
                        "~/plugins/datatables-select/js/dataTables.select.min.js",
                        "~/plugins/datatables-buttons/js/dataTables.buttons.min.js",
                        "~/plugins/datatables-buttons/js/buttons.bootstrap4.min.js",
                        "~/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js",
                        // AdminLTE App
                        "~/dist/js/adminlte.min.js",
                        "~/Scripts/push.min.js",
                        "~/dist/js/demo.js"));
            bundles.Add(new StyleBundle("~/adminlte/css").Include(
                          // Font Awesome
                          //"~/plugins/fontawesome-free/css/all.min.css",
                          //< !--iCheck for checkboxes and radio inputs-- >
                          //< link rel = "stylesheet" href = "../../plugins/icheck-bootstrap/icheck-bootstrap.min.css" >
                          "~/plugins/icheck-bootstrap/icheck-bootstrap.min.css",
                          "~/plugins/daterangepicker/daterangepicker.css",
                         // SweetAlert2
                         "~/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css",
                         // Toastr
                         "~/plugins/toastr/toastr.min.css",
                         // DataTables
                         //"~/plugins/datatables/css/jquery.dataTables.min.css",
                         "~/plugins/datatables-bs4/css/dataTables.bootstrap4.css",
                         "~/plugins/datatables-select/css/select.bootstrap4.min.css",
                         "~/plugins/datatables-buttons/css/buttons.dataTables.min.css",
                         // Select2
                         "~/plugins/select2/css/select2.min.css",
                         "~/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css",
                         // Custom CSS
                         "~/dist/css/custom.css",
                         // Theme style
                         "~/dist/css/adminlte.min.css"));
        }
    }
}
