import React from 'react'
import Banner from '../Banner'

const TermsandCon = ({theme,toggle}) => {
  return (
    <>
    <Banner 
    toggle={toggle} theme={theme}
   
    headerText="Terms and Contidions "
    subHeaderText="Read and accept our terms" />
    <div className='px-32 mt-12 mb-12 text-justify'>   

       <p>
        Thank you for visiting Velammal.edu.in Website and reviewing our privacy policy. The policy is simple: We collect no personal information about you unless you choose to provide that information to us. We strictly do not share, give, transfer or sell any of your personal information to any third party.
        </p> 
        <br />
        <p>
        In case, if you want to know about how we record non-personal information when you visit our site or how we use the information that you voluntarily submit, read further:
        </p>

        <h6>
        Non-Personal Information that we Record
        </h6>

        <p>
        On visiting our website, if you just browse through read or download information, our site’s operating system will automatically record some general information about your visit.
        </p>

        <h6>

        During your visit, the web operating system will record:
        </h6>

<ol className='list-decimal ml-[-6] '>
    <li>
        The Internet domain for your internet service, such as “xyz.net” or “xyz.com” if you are using private internet access account or if you connect from college or university domain.
    </li>
    <li>
        The type of browser (such as “Internet explorer version x” or “netscape version x”) that you are using.
    </li>
    <li>
        The operating system that you are currently using (such as Windows, Unix, or Macintosh)
    </li>
    <li>
        The time and date that you visit our site, and the webpages that you visit on our site.
    </li>
    <li>
        The address of the previous website you were visiting, in case you linked us from another website.
    </li>
</ol>

        <br />

        <p>

        This purpose of recording this information is for statistical analysis, to help make our site more useful to visitors. Individual information is not recorded by this tracking system.
        </p>


        <h6>

        Cookies
        </h6>

        <p>
        We use “cookies” on certain Velammal.edu.in pages to help you use our website interactively. If you are wondering what is a cookie?. It is a small file that a website transfers to your computer’s hard disk, usually to keep track of you while you are connected to that site.
        </p>


        <p>
        Cookies of Velammal.edu.in web pages do not collect information about you, but just the “browser” session. The webpages dynamic features becomes easier for you to use because of the cookie, it prevents the cycle of having to provide the same information again as you browse from one page to another.

        </p>


        <p>

        Remember in order to protect your privacy, be sure to close your browser entirely after you have finished conducting your business with a website that uses cookies. In case you are concerned about the potential misuse of information gathered by cookies placed in your system, set your browser to prompt you before it accepts a cookie. Almost all internet browsers have settings that help you identify cookies.
        </p>


        <p>
        When you send us an email, the message usually contains your return email address. Email is not necessarily secure against interception. If you include personally – identifying information in your email because you want to address issues specific to your situation, we may use that information in responding to your request. It is important you send only information necessary to help us process your request.

        </p>


        <h6>
        Information collected from Interactive Forms
        </h6>


        <p>

        Some of our web pages have interactive forms that allow you to voluntarily submit personal information (such as your e-mail address, name, or organization). This happens when you are registering for online counseling, seminars, various tests, quizzes, workshops or training sessions offered by Velammal.edu.in, downloading admission forms from Velammal.edu.in. In those cases, all submitted information is used only for the purposes for which it is intended and is not made available to any third party.
        </p>


        <p>

        When you voluntarily send us electronic mail, we will keep a record of this information so that we can respond to you. We only collect information from you when you register on our site or fill out a form. Also, when filling out a form on our site, you may be asked to enter your: name, e-mail address or phone number. You may, however, visit our site anonymously. In case you have submitted your personal information and contact details, we reserve the rights to Call, SMS, Email or WhatsApp about our products and offers, even if your number has DND activated on it.
        </p>

        <h6>

        Links to Other Sites
        </h6>

        <p>

        Our policy mentioned above discloses the privacy practices for Velammal.edu.in website. However, Velammal.edu.in provides links to other websites. When you leave Velammal.edu.in website, you will be going to sites that are beyond our control. These websites may send their own cookies to users, collect data or solicit personal information. The privacy policies and procedures described here for Velammal.edu.in do not apply to any other external links. It is advisable to read the privacy policies of any site you link from ours, especially where you share any personal information. Be informed. The best person qualified for your privacy is you. 
        </p>

        
    </div>
    </>
  )
}

export default TermsandCon