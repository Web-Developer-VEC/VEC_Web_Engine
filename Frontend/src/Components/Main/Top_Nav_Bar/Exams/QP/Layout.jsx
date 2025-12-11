import { Download } from "lucide-react";
import React from "react";
import {ReactToPrint} from "react-to-print";
import{ useRef} from "react";

const Layout = () => {

    const componentReference = useRef()

    // const downloadPDF = ReactToPrint({
    //     content : () => componentReference.current

    // });

  return (
    <div className="my-20">
      <div className="border border-text w-[70%] mx-auto h-auto min-h-80 p-12 py-16" ref={componentReference} >

        {/* HEADER */}
        <header>
          <div className="border border-text flex flex-row">
            <div className="basis-1/5 border border-2 border-text p-4">helo</div>

            <div className="basis-4/5 text-center border border-3 border-text p-2">
              <h4>VELAMMAL ENGINEERING COLLEGE</h4>
              <i>(An Autonomous institution, Affiliated to Anna university - Chennai)</i>
              <h4>Velammal Newgen park Ambattur - RedHills Road, Chennai - 600 066</h4>
            </div>
          </div>

          <div className="text-center mt-2">
            <h4>CONTINUE INTERNAL TEST -1</h4>
          </div>

          {/* TOP INFO TABLE */}
          <table className="border border-text w-full border-collapse mt-4">
           <tbody>
                <tr>
                    <td className="border border-3 border-text p-2 h-[38px] w-[160px] font-bold">Subject Code :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">23AD301AD</td>
                    <td className="border border-3 border-text p-2 h-[38px] w-[160px] font-bold">Marks :</td>
                    <td className="border border-3 border-text p-2 h-[38px] w-[160px] font-bold">50 mark</td>
                </tr>

                <tr>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">Subject Title :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">BIG DATA ANALYSIS</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">Date :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">11/2/2025</td>
                </tr>

                <tr>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">Department :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">AI&DS</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">Time :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">8:40 to 9:20</td>
                </tr>

                <tr>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">Year / Sem :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">III / VII</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">Set :</td>
                    <td className="border border-3 border-text p-2 h-[38px] font-bold">B</td>
                </tr>
                </tbody>

          </table>
        </header>

        {/* PART - A */}
        <div className="mt-6">
          <h3 className="text-center">Answer All Questions</h3>

          <h5 className="border border-text text-center mt-2 p-1">
            PART-A (10 × 2 = 20 Marks)
          </h5>

          <table className="w-full table-fixed border border-text border-collapse">
            <thead>
              <tr>
                <th className="w-[60px] border border-3 border-text p-2 min-h-[38px]">Q No</th>
                <th className="w-[500px] border border-3 border-text p-2 min-h-[38px]">Questions</th>
                <th className="w-[60px] border border-3 border-text p-2 min-h-[38px]">CO</th>
                <th className="w-[70px] border border-3 border-text p-2 min-h-[38px]">Blooms Level</th>
              </tr>
            </thead>

            <tbody>
              {[1, 2, 3, 4, 5].map((num) => (
                <tr key={num}>
                  <td className="border border-3 border-text p-2 min-h-[38px]">{num}.</td>
                  <td className="border border-3 border-text p-2 min-h-[38px]">
                    {[
                      "What is meant by Big Data?",
                      "What is Hadoop?",
                      "Define MapReduce.",
                      "What is HDFS?",
                      "Define Big Data Analytics.",
                    ][num - 1]}
                  </td>
                  <td className="border border-3 border-text p-2 min-h-[38px]">CO1</td>
                  <td className="border border-3 border-text p-2 min-h-[38px]">C1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PART - B */}
        <div className="mt-10">
          <h5 className="border border-text text-center p-1">
            PART-B (2 × 15 = 30 Marks)
          </h5>

          <table className="w-full table-fixed border border-text border-collapse">
            <thead>
              <tr>
                <th className="w-[60px] border-3 border border-text p-2 min-h-[38px]">Q No</th>
                <th className="w-[60px] border-3 border border-text p-2 min-h-[38px]">Option</th>
                <th className="w-[450px] border-3 border border-text p-2 min-h-[38px]">Question</th>
                <th className="w-[60px] border-3 border border-text p-2 min-h-[38px]">Marks</th>
                <th className="w-[60px] border-3 border border-text p-2 min-h-[38px]">CO</th>
                <th className="w-[70px] border-3 border border-text p-2 min-h-[38px]">Blooms Level</th>
              </tr>
            </thead>

            <tbody>
              {/* Question 11 (a) */}
              <tr>
                <td rowSpan="3" className="border border-text p-2 min-h-[38px]">
                  11.
                </td>
                <td className="border border-3 border-text p-2 min-h-[38px]">(a)</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">
                  (i) Find the eigenvalues and eigenvectors of the matrix <br /><br />
                  A = [ 4 8 ] <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;[ 6 26 ]
                </td>
                <td className="border border-3 border-text p-2 min-h-[38px]">15</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">CO1</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">C4</td>
              </tr>

              {/* OR */}
              <tr>
                <td colSpan="5" className="border border-3 border-text text-center p-2 font-bold min-h-[38px]">
                  (OR)
                </td>
              </tr>

              {/* 11 (b-i) */}
              <tr>
                <td className="border border-3 border-text p-2 min-h-[38px]">(b)</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">
                  (i) Describe Stochastic Gradient Descent.
                </td>
                <td className="border border-3 border-text p-2 min-h-[38px]">10</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">CO1</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">C2</td>
              </tr>

              {/* 11 (b-ii) */}
              <tr>
                <td className="border border-3 border-text min-h-[38px] p-2"></td>
                <td className="border border-3 border-text min-h-[38px] p-2"></td>
                <td className="border border-3 border-text p-2 min-h-[38px]">
                  (ii) Explain the challenges motivating in Deep Learning.
                </td>
                <td className="border border-3 border-text p-2 min-h-[38px]">5</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">CO1</td>
                <td className="border border-3 border-text p-2 min-h-[38px]">C2</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>


      <div className="w-fit p-2 px-2 rounded  bg-secd hover:bg-brwn text-text hover:text-prim mx-auto  mt-8 ">
      <button className="flex flex-row gap-2 " >&nbsp;<Download/> Download &nbsp;</button>
     
      </div>
    </div>
  );
};

export default Layout;
